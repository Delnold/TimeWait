import os

def consolidate_files(input_dir, output_file, extensions=None, exclude_paths=None):
    """
    Traverses the input directory, reads files, and writes their contents to the output file.
    Each file's content is preceded by its file path.

    :param input_dir: Path to the input directory to scan.
    :param output_file: Path to the output text file.
    :param extensions: Optional list of file extensions to include (e.g., ['.txt', '.py']).
    :param exclude_paths: Optional list of file or directory paths to exclude.
    """
    # Normalize exclude paths to absolute paths for accurate comparison
    exclude_paths = exclude_paths or []
    exclude_paths = [os.path.abspath(path) for path in exclude_paths]

    with open(output_file, 'w', encoding='utf-8') as outfile:
        for root, dirs, files in os.walk(input_dir):
            # Convert current root to absolute path
            abs_root = os.path.abspath(root)

            # Modify dirs in-place to skip excluded directories
            dirs[:] = [d for d in dirs if os.path.abspath(os.path.join(root, d)) not in exclude_paths]

            for filename in files:
                file_path = os.path.join(root, filename)
                abs_file_path = os.path.abspath(file_path)

                # Skip if the file is in the exclude_paths
                if abs_file_path in exclude_paths:
                    continue

                # If extensions are specified, skip files that don't match
                if extensions:
                    if not any(filename.lower().endswith(ext.lower()) for ext in extensions):
                        continue

                try:
                    with open(file_path, 'r', encoding='utf-8') as infile:
                        content = infile.read()

                    # Write the file path as a header
                    outfile.write(f"\n=== File: {file_path} ===\n")
                    outfile.write(content)
                    outfile.write("\n")  # Add a newline for separation

                except (UnicodeDecodeError, PermissionError, IsADirectoryError):
                    # Skip binary files, inaccessible files, and directories
                    continue
                except Exception:
                    # Catch-all for any other exceptions, continue silently
                    continue

def main():
    # Global paths (Specify your paths here)
    INPUT_DIR = r"C:\PersonalProjects\TimeWait\frontend"        # Replace with your input directory path
    OUTPUT_FILE = r"output.txt"       # Replace with your desired output file path

    # Optional: Specify file extensions to include
    # Set to None to include all readable text files
    EXTENSIONS = ['.txt', '.py', '.md', 'js']  # Example extensions

    # Optional: Specify paths to exclude
    # These can be files or directories
    EXCLUDE_PATHS = [
        r"C:\PersonalProjects\TimeWait\backend\venv",  # Example directory to exclude
        r"C:\PersonalProjects\TimeWait\backend\.venv",
        r"C:\PersonalProjects\TimeWait\frontend\node_modules",
        r"C:\PersonalProjects\TimeWait\backend",
        r"C:\PersonalProjects\TimeWait\frontend"

        # Example file to exclude
    ]

    # Ensure the input directory exists
    if not os.path.isdir(INPUT_DIR):
        print(f"Error: The specified input directory does not exist: {INPUT_DIR}")
        return

    # Ensure the output directory exists; create if it doesn't
    output_dir = os.path.dirname(os.path.abspath(OUTPUT_FILE))
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)

    consolidate_files(INPUT_DIR, OUTPUT_FILE, extensions=EXTENSIONS, exclude_paths=EXCLUDE_PATHS)

if __name__ == "__main__":
    main()
