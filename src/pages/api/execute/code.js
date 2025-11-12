import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import Docker from 'dockerode';
import tar from 'tar-fs';
import { Writable } from 'stream';

const docker = new Docker();

// A simple stream demultiplexer for Docker streams
const demuxStream = (stream, onStdout, onStderr) => {
  const stdout = new Writable({
    write(chunk, encoding, callback) {
      onStdout(chunk.toString());
      callback();
    },
  });

  const stderr = new Writable({
    write(chunk, encoding, callback) {
      onStderr(chunk.toString());
      callback();
    },
  });

  stream.on('end', () => {
    stdout.end();
    stderr.end();
  });

  docker.modem.demuxStream(stream, stdout, stderr);
};

async function execInContainer(container, cmd, inputContent = '', timeout = 10000) {
  return new Promise(async (resolve, reject) => {
    let execInstance;
    try {
      // Write input to a file if provided
      if (inputContent) {
        const inputTarStream = tar.pack();
        inputTarStream.entry({ name: 'input.txt' }, inputContent);
        inputTarStream.finalize();
        await container.putArchive(inputTarStream, { path: '/' });
        cmd = `cat /input.txt | ${cmd}`;
      }

      execInstance = await container.exec({
        Cmd: ['bash', '-c', cmd],
        AttachStdout: true,
        AttachStderr: true,
      });
    } catch (err) {
      return reject(err);
    }

    let stdout = '';
    let stderr = '';

    const stream = await execInstance.start({ hijack: true, stdin: false });

    demuxStream(stream, (data) => (stdout += data), (data) => (stderr += data));

    stream.on('error', (err) => reject(err));

    const timer = setTimeout(() => {
      stream.destroy();
      reject(new Error('Timeout'));
    }, timeout);

    stream.on('end', async () => {
      clearTimeout(timer);
      try {
        const inspectData = await execInstance.inspect();
        resolve({ stdout, stderr, exitCode: inspectData.ExitCode });
      } catch (inspectErr) {
        reject(new Error(`Failed to inspect exec instance: ${inspectErr.message}`));
      }
    });

    stream.on('close', async () => {
      clearTimeout(timer);
      try {
        const inspectData = await execInstance.inspect();
        resolve({ stdout, stderr, exitCode: inspectData.ExitCode });
      } catch (inspectErr) {
        reject(new Error(`Failed to inspect exec instance: ${inspectErr.message}`));
      }
    });
  });
}

async function logForML(data) {
  try {
    await fs.mkdir(path.dirname('ml_logs.jsonl'), { recursive: true });
    await fs.appendFile('ml_logs.jsonl', JSON.stringify(data) + '\n');

  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile('ml_logs.jsonl', JSON.stringify(data) + '\n');
    } else {
      console.error("Failed to log for ML:", error);
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { code, language, inputs, mode } = req.body;

  if (!code || !language || !Array.isArray(inputs)) {
    return res.status(400).json({ error: 'Invalid input: code, language, and inputs are required.' });
  }

  let container;
  try {
    container = await docker.createContainer({
      Image: 'code-runner',
      Tty: false,
      Cmd: ['tail', '-f', '/dev/null'],
      HostConfig: {
        Memory: 512 * 1024 * 1024, // 512MB
        CpuPeriod: 200000,
        CpuQuota: 200000, // 2 cores
      },
    });
    console.log("Container created");
    await container.start();
    let attempts = 0;
    while (attempts < 5) {
      const info = await container.inspect();
      if (info.State.Status === 'running') break;
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 0.5s
      attempts++;
    }
    if (attempts === 5) throw new Error('Container failed to start or is not running after multiple attempts.');
    console.log("Container started");

    const tempFile = language === 'cpp' ? 'code.cpp' : 'code.py';
    const tarStream = tar.pack();
    tarStream.entry({ name: tempFile }, code);
    tarStream.finalize();
    console.log("Tar stream created");

    await container.putArchive(tarStream, { path: '/' }).catch(err => {
      throw new Error('Upload failed: ' + err.message);
    });
    console.log("Code copied to container");

    let compileErrors = '';
    let output = [];
    let metrics = { compileTime: 0, runTime: 0, memoryUsed: 0 };

    const start = Date.now();

    if (language === 'cpp') {
      console.log("Attempting C++ compilation");
      const compileRes = await execInContainer(container, `g++ /${tempFile} -o /exec -std=c++17`);
      compileErrors = compileRes.stderr;
      metrics.compileTime = Date.now() - start;
      if (compileErrors) {
        console.error("C++ compilation failed:", compileErrors);
        return res.json({ output, errors: compileErrors, metrics });
      }
      if (compileRes.stdout) console.log('Compile output:', compileRes.stdout);
      console.log("C++ compilation successful");
    }

    console.log("Starting code execution");
    const testCases = mode === 'test' ? inputs.slice(0, 2) : inputs;
    for (const { input, expected } of testCases) {
      const runStart = Date.now();
      const cmd = language === 'cpp' ? `./exec` : `python3 /${tempFile}`;
      console.log(`Executing command: ${cmd} with input: ${input}`);
      const runRes = await execInContainer(container, cmd, input, 5000);
      metrics.runTime += Date.now() - runStart;
      const passed = runRes.stdout.trim() === expected.trim() && runRes.exitCode === 0;
      output.push({ input, output: runRes.stdout, passed, stderr: runRes.stderr, exitCode: runRes.exitCode });
      if (!passed && runRes.exitCode !== 0) {
        console.log(`Test case failed with exit code ${runRes.exitCode}: Input: ${input}, Stderr: ${runRes.stderr}`);
      } else if (!passed) {
        console.log(`Test case failed: Input: ${input}, Expected: ${expected}, Actual: ${runRes.stdout}`);
      }
      console.log(`Execution result: Passed: ${passed}, Stdout: ${runRes.stdout}, Stderr: ${runRes.stderr}`);
    }
    console.log("Code execution finished");

    const stats = await container.stats({ stream: false });
    metrics.memoryUsed = stats.memory_stats.usage;
    console.log("Memory usage obtained");

    await logForML({ code, language, metrics, output });
    console.log("Logged for ML");

    res.json({ output, errors: compileErrors, metrics });
  } catch (err) {
    console.error("Error in execute/code API:", err);
    res.status(500).json({ errors: err.message });
  } finally {
    if (container) {
      try {
        await container.stop();
        await container.remove({ force: true });
      } catch (error) {
        console.error("Failed to stop or remove container:", error);
      }
    }
  }
}