import os
from rembg import remove
from PIL import Image

def process_and_replace(input_name, target_name):
    input_path = os.path.join('assets', 'img', input_name)
    target_path = os.path.join('assets', 'img', target_name)
    
    if os.path.exists(input_path):
        print(f"Procesando {input_name}...")
        try:
            with open(input_path, 'rb') as i:
                input_data = i.read()
            output_data = remove(input_data)
            
            with open(target_path, 'wb') as o:
                o.write(output_data)
            print(f"¡Éxito! Reemplazado {target_name}")
            
            # Remove original uploaded file after processing
            os.remove(input_path)
        except Exception as e:
            print(f"Error procesando {input_name}: {e}")
    else:
        print(f"No se encontró {input_name}")

mappings = {
    "cricket png.png": "p06_cricket.png",
    "vespa electrica png.png": "p07_vespa.png",
    "triciclos 250cc png.png": "p09_treck250.png",
    "triciclo 1000 png.png": "p10_haozong.png",
    "triciclo 1000w png.png": "p12_yaolong.png"
}

if __name__ == "__main__":
    for in_file, out_file in mappings.items():
        process_and_replace(in_file, out_file)
    print("¡Proceso completado!")
