#!/usr/bin/env python3

import os
import sys
import struct
import shutil


def is_valid_png(file_path):
    with open(file_path, "rb") as f:
        # Check PNG signature
        if f.read(8) != b"\x89PNG\r\n\x1a\n":
            return False

        # Check for IHDR chunk
        f.seek(8)
        chunk_length, chunk_type = struct.unpack(">I4s", f.read(8))
        if chunk_type != b"IHDR":
            return False

        # Check IHDR length
        if chunk_length != 13:
            return False

    return True


def decrypt(input_file, output_file):
    with open(input_file, "rb") as f:
        data = f.read()

    ###
    # PNG file rolling XOR decryption
    # 1. Create decryption key using first 4 bytes of a standard PNG file [0x89, 0x50, 0x4E, 0x47]
    # 2. Extract the bound value from the last 5th byte indicating how many bytes at the beginning are encrypted
    # 3. Decrypt the next number of bytes according to the bound value using rolling XOR decryption
    # 4. Reassemble the decrypted data with the rest of the file and the standard PNG ending bytes
    ###

    key = [
        original ^ cipher
        for original, cipher in zip([0x89, 0x50, 0x4E, 0x47], data[:4])
    ]
    bound = data[-5]
    print(
        f"Decrypting PNG file {input_file} with XOR key: {[hex(k) for k in key]} and bound: {hex(bound)}"
    )

    decrypted = []
    for i in range(bound):
        keyByte = key.pop(0)
        key.append(keyByte)

        decryptedByte = data[i]
        decrypted.append(decryptedByte ^ keyByte)

    with open(output_file, "wb") as f:
        f.write(
            (
                bytes(decrypted[:bound])
                + data[bound:-12]
                + bytes(
                    [
                        0x00,
                        0x00,
                        0x00,
                        0x00,
                        0x49,
                        0x45,
                        0x4E,
                        0x44,
                        0xAE,
                        0x42,
                        0x60,
                        0x82,
                    ]
                )
            )
        )


def process_directory(input_dir, output_dir):
    for root, _, files in os.walk(input_dir):
        for file in files:
            if not file.lower().endswith(".png"):
                continue
                
            input_path = os.path.join(root, file)
            relative_path = os.path.relpath(input_path, input_dir)
            output_path = os.path.join(output_dir, relative_path)

            os.makedirs(os.path.dirname(output_path), exist_ok=True)

            if is_valid_png(input_path):
                shutil.copy(input_path, output_path)
            else:
                decrypt(input_path, output_path)

def main():
    input_dir = input("Path to update directory for decryption: ").strip()
    if not os.path.isdir(input_dir):
        print("Error: Invalid directory path")
        exit(1)

    output_dir = os.path.join(
        os.path.dirname(os.path.abspath(sys.argv[0])), "decrypted"
    )
    os.makedirs(output_dir, exist_ok=True)

    for dir in ["res", "Resource/en/res"]:
        process_directory(os.path.join(input_dir, dir), os.path.join(output_dir, dir))

    print(f"Decryption complete. Decrypted images are at {output_dir}")


if __name__ == "__main__":
    main()