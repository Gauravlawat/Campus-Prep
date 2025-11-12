import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

# Model name from Hugging Face
model_name = "codellama/CodeLlama-7b-hf"  # Or "codellama/CodeLlama-7b-Instruct-hf" for instruct version

# Quantization config to fit in 4GB VRAM
quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,  # Reduces memory usage
    bnb_4bit_compute_dtype=torch.float16  # Optimizes for your GPU
)

print(f"Downloading and loading {model_name}... This may take 10-30 minutes depending on your internet.")

# Download tokenizer (small, quick)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Download and load model (main download happens here)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=quantization_config,
    device_map="auto"  # Auto-uses GPU if available
)

print("Model downloaded and loaded successfully! It's now cached locally.")
print(f"Model path: {model.config._name_or_path}")

# Optional: Test with a simple prompt
prompt = "def hello_world():"
inputs = tokenizer(prompt, return_tensors="pt").to("cuda" if torch.cuda.is_available() else "cpu")
outputs = model.generate(**inputs, max_new_tokens=50)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
