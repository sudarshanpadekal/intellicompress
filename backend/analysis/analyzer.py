import math
import collections

def calculate_entropy(text):
    if not text:
        return 0.0
    freq = collections.Counter(text)
    length = len(text)
    entropy = 0.0
    for count in freq.values():
        p_x = count / length
        entropy += -p_x * math.log2(p_x)
    return entropy

def analyze_file(text):
    if not text:
        return {
            "entropy": 0,
            "redundancy": 0,
            "recommendation": "None",
            "confidence": 0,
            "explanation": "File is empty."
        }
        
    entropy = calculate_entropy(text)
    length = len(text)
    
    # Max possible entropy is log2(alphabet_size)
    unique_chars = len(set(text))
    max_entropy = math.log2(unique_chars) if unique_chars > 1 else 0
    
    redundancy = 1 - (entropy / max_entropy) if max_entropy > 0 else 1.0
    
    # Simple heuristics for recommendation
    # Huffman shines with uneven frequencies (lower entropy)
    # RLE shines with lots of sequential repetition (high redundancy, consecutive dupes)
    # LZW shines with repeating patterns of words/strings
    
    consecutive_dupes = sum(1 for i in range(1, length) if text[i] == text[i-1])
    consecutive_ratio = consecutive_dupes / length
    
    if consecutive_ratio > 0.4:
        recommendation = "RLE"
        confidence = 90
        explanation = "Run-Length Encoding is recommended because the text contains a high number of consecutive repeating characters."
    elif redundancy > 0.3:
        recommendation = "Huffman"
        confidence = 85
        explanation = "Huffman is recommended because character frequencies are highly uneven, offering good potential for variable-length encoding."
    else:
        recommendation = "LZW"
        confidence = 80
        explanation = "LZW is recommended for general text as it efficiently builds a dictionary of repeating patterns and words."
        
    return {
        "entropy": round(entropy, 4),
        "redundancy": round(redundancy * 100, 2), # percentage
        "consecutive_ratio": round(consecutive_ratio * 100, 2),
        "recommendation": recommendation,
        "confidence": confidence,
        "explanation": explanation,
        "char_count": length,
        "unique_chars": unique_chars
    }
