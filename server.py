#!/usr/bin/env python3
"""
Servidor HTTP simples para testar as implementações 360°
Resolve problemas de CORS e permite testar localmente
"""

import http.server
import socketserver
import os
import sys
from urllib.parse import urlparse, parse_qs
import json

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Adicionar headers CORS para permitir carregamento de recursos
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        # Headers para cache de imagens
        if self.path.endswith(('.jpg', '.jpeg', '.png')):
            self.send_header('Cache-Control', 'public, max-age=3600')
        
        # Headers para JavaScript modules
        if self.path.endswith('.js'):
            self.send_header('Content-Type', 'application/javascript')
        
        super().end_headers()
    
    def do_OPTIONS(self):
        # Responder a requisições OPTIONS para CORS
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        # Log das requisições para debug
        print(f"GET: {self.path}")
        
        # Rota especial para informações do servidor
        if self.path == '/server-info':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            info = {
                'status': 'running',
                'port': PORT,
                'files': self.list_360_files(),
                'tests': self.list_test_files()
            }
            
            self.wfile.write(json.dumps(info, indent=2).encode())
            return
        
        # Servir arquivos normalmente
        super().do_GET()
    
    def list_360_files(self):
        """Lista arquivos 360° disponíveis"""
        files = []
        for file in os.listdir('.'):
            if file.lower().endswith(('.jpg', '.jpeg', '.png')) and '360' in file.lower():
                files.append({
                    'name': file,
                    'size': os.path.getsize(file),
                    'url': f'http://localhost:{PORT}/{file}'
                })
        return files
    
    def list_test_files(self):
        """Lista arquivos de teste disponíveis"""
        tests = []
        for file in os.listdir('.'):
            if file.startswith('test-') and file.endswith('.html'):
                tests.append({
                    'name': file,
                    'title': self.extract_title(file),
                    'url': f'http://localhost:{PORT}/{file}'
                })
        return tests
    
    def extract_title(self, filename):
        """Extrai título do arquivo de teste"""
        titles = {
            'test-pannellum.html': 'Teste Pannellum - Hotspots Fixos',
            'test-photo-sphere-viewer.html': 'Teste Photo Sphere Viewer - Markers',
            'test-marzipano.html': 'Teste Marzipano - Hotspots 3D',
            'test-comparison.html': 'Comparação de Bibliotecas 360°'
        }
        return titles.get(filename, filename)

def start_server(port=8000):
    """Inicia o servidor HTTP"""
    global PORT
    PORT = port
    
    try:
        with socketserver.TCPServer(("", port), CustomHTTPRequestHandler) as httpd:
            print(f"🚀 Servidor iniciado em http://localhost:{port}")
            print(f"📁 Servindo arquivos do diretório: {os.getcwd()}")
            print("\n📋 Arquivos de teste disponíveis:")
            
            # Listar arquivos de teste
            for file in os.listdir('.'):
                if file.startswith('test-') and file.endswith('.html'):
                    print(f"   • http://localhost:{port}/{file}")
            
            print(f"\n🖼️ Imagens 360° encontradas:")
            for file in os.listdir('.'):
                if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                    size_mb = os.path.getsize(file) / (1024 * 1024)
                    print(f"   • {file} ({size_mb:.1f} MB)")
            
            print(f"\n📊 Página de comparação: http://localhost:{port}/test-comparison.html")
            print(f"ℹ️  Informações do servidor: http://localhost:{port}/server-info")
            print("\n⚠️  Pressione Ctrl+C para parar o servidor")
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Servidor parado pelo usuário")
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"❌ Porta {port} já está em uso. Tentando porta {port + 1}...")
            start_server(port + 1)
        else:
            print(f"❌ Erro ao iniciar servidor: {e}")

def main():
    """Função principal"""
    port = 8000
    
    # Verificar se uma porta foi especificada
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("❌ Porta inválida. Usando porta padrão 8000.")
    
    # Verificar se estamos no diretório correto
    if not any(f.endswith('.jpg') or f.endswith('.JPG') for f in os.listdir('.')):
        print("⚠️  Nenhuma imagem 360° encontrada no diretório atual.")
        print("   Certifique-se de estar no diretório correto.")
    
    start_server(port)

if __name__ == "__main__":
    main()
