import os
import shutil

mappings = {
    "cricket png.png": "p06_cricket.png",
    "vespa electrica png.png": "p07_vespa.png",
    "triciclos 250cc png.png": "p09_treck250.png",
    "triciclo 1000 png.png": "p10_haozong.png",
    "triciclo 1000w png.png": "p12_yaolong.png"
}

def process_and_replace():
    for in_file, out_file in mappings.items():
        input_path = os.path.join('assets', 'img', in_file)
        target_path = os.path.join('assets', 'img', out_file)
        
        if os.path.exists(input_path):
            print(f"Reemplazando {out_file} con {in_file}...")
            shutil.copy2(input_path, target_path)
            # Remove original to clean up
            os.remove(input_path)
        else:
            print(f"No se encontró {in_file}")

if __name__ == "__main__":
    process_and_replace()
    print("¡Imágenes reemplazadas!")
