-- =====================================================
-- db_lab10 · TechParts Admin (E-commerce de hardware)
-- =====================================================
CREATE DATABASE IF NOT EXISTS db_lab10
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE db_lab10;

DROP TABLE IF EXISTS productos;

CREATE TABLE productos (
  id               INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  sku              VARCHAR(30)   NOT NULL,
  nombre           VARCHAR(150)  NOT NULL,
  categoria        VARCHAR(50)   NOT NULL,
  marca            VARCHAR(80)   NOT NULL,
  precio           DECIMAL(10,2) NOT NULL,
  stock            INT UNSIGNED  NOT NULL DEFAULT 0,
  especificaciones VARCHAR(255)  NULL,
  activo           TINYINT(1)    NOT NULL DEFAULT 1,
  created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_productos_sku (sku),
  KEY idx_productos_categoria (categoria),
  CONSTRAINT chk_precio CHECK (precio >= 0)
) ENGINE=InnoDB;

INSERT INTO productos (sku, nombre, categoria, marca, precio, stock, especificaciones) VALUES
('CPU-AMD-7600',   'Ryzen 5 7600',                         'Procesadores',      'AMD',      849.00, 14, 'Socket AM5 · 6 núcleos / 12 hilos · hasta 5.1 GHz'),
('CPU-INT-14400F', 'Core i5-14400F',                       'Procesadores',      'Intel',    799.00, 11, 'Socket LGA1700 · 10 núcleos / 16 hilos · hasta 4.7 GHz'),
('CPU-AMD-7800X3D','Ryzen 7 7800X3D',                      'Procesadores',      'AMD',     1699.00,  5, 'Socket AM5 · 8 núcleos · 96 MB L3 con 3D V-Cache'),
('GPU-NV-4060',    'GeForce RTX 4060 8GB',                 'Tarjetas Gráficas', 'NVIDIA',  1349.00,  9, '8 GB GDDR6 · bus 128-bit · DLSS 3'),
('GPU-AMD-7600XT', 'Radeon RX 7600 XT 16GB',               'Tarjetas Gráficas', 'AMD',     1299.00,  3, '16 GB GDDR6 · bus 128-bit · FSR 3'),
('GPU-NV-4070S',   'GeForce RTX 4070 Super 12GB',          'Tarjetas Gráficas', 'NVIDIA',  2899.00,  4, '12 GB GDDR6X · bus 192-bit · DLSS 3'),
('MB-ASU-B650',    'ASUS TUF Gaming B650-Plus WiFi',       'Placas Madre',      'ASUS',     899.00,  7, 'Socket AM5 · ATX · DDR5 · WiFi 6'),
('MB-MSI-B760',    'MSI PRO B760M-P DDR4',                 'Placas Madre',      'MSI',      459.00, 12, 'Socket LGA1700 · mATX · DDR4'),
('MB-GIG-Z790',    'Gigabyte Z790 Aorus Elite AX',         'Placas Madre',      'Gigabyte',1189.00,  2, 'Socket LGA1700 · ATX · DDR5 · WiFi 6E'),
('RAM-COR-16D5',   'Corsair Vengeance 16GB (2x8) DDR5-5600','Memoria RAM',      'Corsair',  289.00, 30, 'DDR5 · 5600 MHz · CL36 · kit 2x8 GB'),
('RAM-KIN-32D4',   'Kingston Fury Beast 32GB (2x16) DDR4', 'Memoria RAM',       'Kingston', 319.00, 18, 'DDR4 · 3200 MHz · CL16 · kit 2x16 GB'),
('RAM-GSK-32D5',   'G.Skill Trident Z5 RGB 32GB DDR5-6000','Memoria RAM',       'G.Skill',  579.00,  6, 'DDR5 · 6000 MHz · CL30 · RGB'),
('SSD-KIN-NV2-1T', 'Kingston NV2 1TB NVMe',                'Almacenamiento',    'Kingston', 229.00, 40, 'M.2 NVMe PCIe 4.0 · hasta 3500 MB/s'),
('SSD-SAM-990-1T', 'Samsung 990 EVO 1TB NVMe',             'Almacenamiento',    'Samsung',  389.00, 15, 'M.2 NVMe PCIe 4.0/5.0 · hasta 5000 MB/s'),
('HDD-SEA-2T',     'Seagate Barracuda 2TB',                'Almacenamiento',    'Seagate',  259.00, 20, '3.5" SATA III · 7200 RPM · 256 MB caché'),
('PSU-COR-RM750E', 'Corsair RM750e 750W',                  'Fuentes de Poder',  'Corsair',  489.00, 10, '80 Plus Gold · full modular · ATX 3.0'),
('PSU-EVG-600W1',  'EVGA 600 W1 600W',                     'Fuentes de Poder',  'EVGA',     189.00,  1, '80 Plus White · no modular'),
('COOL-DEE-AK400', 'DeepCool AK400',                       'Refrigeración',     'DeepCool', 119.00, 25, 'Disipador por aire · 4 heatpipes · ventilador 120 mm'),
('COOL-NZX-K240',  'NZXT Kraken 240',                      'Refrigeración',     'NZXT',     549.00,  0, 'Líquida AIO 240 mm · pantalla LCD'),
('CASE-COR-4000D', 'Corsair 4000D Airflow',                'Gabinetes',         'Corsair',  379.00,  8, 'Mid Tower ATX · vidrio templado · alto flujo de aire'),
('CASE-NZX-H5',    'NZXT H5 Flow',                         'Gabinetes',         'NZXT',     349.00,  4, 'Mid Tower ATX · panel frontal perforado');