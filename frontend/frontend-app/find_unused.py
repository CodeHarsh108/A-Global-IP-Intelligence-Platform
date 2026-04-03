
import os
import re

def find_unused_imports(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        for file in files:
            if file.endswith('.jsx') or file.endswith('.js'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Find lucide-react imports
                match = re.search(r'import\s+\{\s*([^}]+)\s*\}\s+from\s+"lucide-react"', content)
                if match:
                    imports = [i.strip() for i in match.group(1).split(',')]
                    unused = []
                    for imp in imports:
                        if not imp: continue
                        # Check if used in JSX or code (excluding the import line)
                        # We use a simple regex to check for usage
                        body = content[match.end():]
                        if not re.search(r'\b' + re.escape(imp) + r'\b', body):
                            unused.append(imp)
                    
                    if unused:
                        print(f"File: {filepath}")
                        print(f"Unused lucide-react: {unused}")

                # Find react-router-dom imports (Link, etc.)
                match = re.search(r'import\s+\{\s*([^}]+)\s*\}\s+from\s+"react-router-dom"', content)
                if match:
                    imports = [i.strip() for i in match.group(1).split(',')]
                    unused = []
                    for imp in imports:
                        if not imp: continue
                        body = content[match.end():]
                        if not re.search(r'\b' + re.escape(imp) + r'\b', body):
                            unused.append(imp)
                    
                    if unused:
                        print(f"File: {filepath}")
                        print(f"Unused react-router-dom: {unused}")

if __name__ == "__main__":
    find_unused_imports('src')
