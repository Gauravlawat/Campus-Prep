import os
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from accelerate import infer_auto_device_map, init_empty_weights  # For custom device map

# Set paths and configs
model_name = "codellama/CodeLlama-7b-hf"
local_dir = "./codellama-7b"  # Your downloaded folder

# Quantization config (same as before)
quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True  # Extra compression for low VRAM
)

# Enable CPU offloading for fp32 modules (as per error message)
# This allows parts of the model to run on CPU when GPU RAM is full
offload_config = {
    "llm_int8_enable_fp32_cpu_offload": True  # Key flag to fix the error
}

print("Generating custom device map for low VRAM...")

# Create a custom device map: Put as much as possible on GPU (cuda:0), offload rest to CPU
with init_empty_weights():
    model = AutoModelForCausalLM.from_pretrained(model_name)  # Dummy load to get architecture

device_map = infer_auto_device_map(
    model,
    max_memory={0: "3.5GiB", "cpu": "7GiB"},  # Limit GPU to ~3.5GB (safe for 4GB card), use up to 7GB RAM
    no_split_module_classes=["LlamaDecoderLayer"],  # Don't split layers
    dtype=torch.float16
)

print("Loading model with CPU offloading...")

model = AutoModelForCausalLM.from_pretrained(
    local_dir,
    quantization_config=quantization_config,
    device_map=device_map,
    offload_folder="offload",  # Folder for offloaded weights
    **offload_config  # Enable the fp32 offload
)

tokenizer = AutoTokenizer.from_pretrained(local_dir)

print("Model loaded successfully with offloading!")

# Test inference
prompt = "def hello_world():"
inputs = tokenizer(prompt, return_tensors="pt").to("cuda" if torch.cuda.is_available() else "cpu")
outputs = model.generate(**inputs, max_new_tokens=50)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
