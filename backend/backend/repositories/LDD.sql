CREATE domain codigo_banco AS VARCHAR(4)
NOT NULL
CHECK (
    VALUE ~ '^[0-9]{4}$' -- Asegura que sean 4 dígitos
    AND
    VALUE::INTEGER BETWEEN 1 AND 9999 -- Asegura que el valor numérico esté en el rango
);

CREATE DOMAIN NRO_CUENTA as varchar(16)
NOT NULL
CHECK(
	VALUE ~ '^[0-9]{16}$'
	
); 

create table Proveedores(

	rif varchar(100) PRIMARY KEY,
	razon_social varchar(200) unique not null, 
	persona_contacto varchar(200) not null,
	email varchar(200) unique not null, 
	descripcion varchar(255)
);

create table Empresas(
	id serial PRIMARY KEY,
	email varchar(200) not null unique, 
	nombreComerciar varchar(200) not null, 
	razonSocial varchar(200) unique,
	rif varchar(100) unique, 
	fecha_fundacion date,
	direcion varchar(200) not null, 
	password varchar(255)
);

create table Servicios(
	id_empresa INT, 
	nro_servicio INT, 
	nombre varchar(100) not null, 
	descripcion varchar(255),
	plazo date, --debe estar en días 
	precio float check(precio >= 0),
	
	PRIMARY KEY(id_empresa,nro_servicio),
	foreign key(id_empresa) references Empresas(id)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT
);

create table OrdenCompra(
	nro_orden serial PRIMARY KEY,
	desripcion varchar(255),
	fecha_compra date not null, 
	id_empresa int, 
	rif_proveedor varchar(100),
	foreign key (id_empresa) references Empresas(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT,
	foreign key (rif_proveedor) references Proveedores(rif)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT
);

create table Productos(
	id serial primary key, 
	nombre varchar(255) not null, 
	descripcion varchar(255),
	cantidad_minima int check(cantidad_minima >= 0),
	cantidad_maxima int check(cantidad_maxima >= 0),
	precio_venta float check (precio_venta >= 0)
);

create table Bancos(
	codigo codigo_banco PRIMARY KEY,
	nombre varchar(100) unique not null
);

create table Empleados(
	CI varchar(100) primary key,
	email varchar(200) not null unique, 
	nombre varchar(100) not null, 
	apellido varchar(100) not null, 
	telefono varchar(100) not null, 
	fecha_nacimiento date, 
	fecha_llegada_empresa date, 
	descripcionCargo varchar(255),
	empresa_trabaja int, 
	empresaEncargado int, 
	fecha_encargo date, 
	
	foreign key (empresa_trabaja) references Empresas(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT,
	foreign key (empresaEncargado) references Empresas(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT
);

create table Automatizaciones(

	id serial primary key, 
	nombre varchar(255) not null, 
	descripcion varchar(255), 
	jsonString varchar(255), 
	id_empresa int,
	
	foreign key (id_empresa) references Empresas(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT
);

create table Clientes(

	CI varchar(100) PRIMARY KEY, 
	nombre varchar(100) not null, 
	apellido varchar(100) not null,
	email varchar(100)
);

create table OrdenVenta(

	nro_orden serial primary key, 
	descripcion varchar(255), 
	fechaVenta date not null, 
	referencia varchar(255) not null unique, 
	ci_cliente varchar(100),
	id_empresa int, 
	
	foreign key (ci_cliente) references Clientes(CI)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT,
	foreign key (id_empresa) references Empresas(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT
);

create table PagoMovil( 
	codigoBanco codigo_banco, 
	cedula_RIF varchar(100), 
	telefono varchar(100),
	
	
	PRIMARY KEY(codigoBanco,cedula_RIF,telefono),
	foreign key(codigoBanco) references Bancos(codigo)
		ON UPDATE CASCADE
		ON DELETE RESTRICT
);

create table DatosBancarios(
	codigoBanco codigo_banco, 
	nro_cuenta NRO_CUENTA,
	rif_cedula varchar(100),
	id_empresa INT,
	
	PRIMARY KEY(codigoBanco,nro_cuenta),
	foreign key(codigoBanco) references Bancos(codigo)
		ON UPDATE CASCADE
		ON DELETE restrict,
	foreign key (id_empresa) references Empresas(id)
		on update restrict
		on delete cascade
);

drop table DatosBancarios; 


create table OrdenCompraProducto(
	nro_orden INT, 
	id_producto INT, 
	cantidad int CHECK(cantidad >= 0), 
	precioUnidad float check(precioUnidad >= 0),
	
	PRIMARY KEY(nro_orden,id_producto),
	foreign key (id_producto) references Productos(id)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT,
	foreign key (nro_orden) references OrdenCompra(nro_orden)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT
);

create table ProductosServicios(

	id_producto int, 
	id_empresa INT, 
	nro_servicio int,
	cantidad int CHECK(cantidad >= 0), 
	
	PRIMARY KEY(id_producto, id_empresa,nro_servicio),
	foreign key(id_empresa,nro_servicio) references Servicios(id_empresa,nro_servicio)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT,
	foreign key(id_producto) references Productos(id)	
		ON UPDATE RESTRICT
		ON DELETE RESTRICT
);

create table Inventario(

	id_empresa int,
	id_producto int, 
	cantidad_actual int check(cantidad_actual >= 0),
	
	PRIMARY KEY(id_empresa, id_producto),
	foreign key(id_producto) references Productos(id)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT,
	foreign key (id_empresa) references Empresas(id)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT
);

create domain estadoServicio AS varchar(20)
NOT NULL
check( VALUE IN ('VIGENTE','POR VENCER','VENCIDO'));

create table OrdenVentaServicios(

	nro_orden INT, 
	id_empresa int, 
	nro_servicio int, 
	fecha_vencimiento date not null, 
	estado estadoServicio default 'VIGENTE',
	
	PRIMARY KEY(nro_orden,id_empresa,nro_servicio), 
	foreign key(id_empresa,nro_servicio) references Servicios(id_empresa,nro_servicio)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT,
	foreign key (nro_orden) references OrdenVenta(nro_orden)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT
);

create table OrdenVentaProductos(

	nro_orden int, 
	id_producto int, 
	precio float check (precio >= 0),
	cantidad int check (cantidad >= 0), 
	
	PRIMARY KEY(nro_orden,id_producto),
	foreign key(id_producto) references Productos(id)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT,
	foreign key (nro_orden) references OrdenVenta(nro_orden)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT
);

create table ClientesEmpresa(

	id_empresa int, 
	ci_cliente varchar(100),
	
	PRIMARY KEY(id_empresa, ci_cliente),
	foreign key (id_empresa) references Empresas(id)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT,
	foreign key (ci_cliente) references Clientes(CI)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT
);

create table TelefonosCliente(
	ci_cliente varchar(100),
	telefono varchar(100),
	PRIMARY KEY(ci_cliente,telefono),
	foreign key (ci_cliente) references Clientes(CI)
		ON UPDATE RESTRICT
		ON DELETE restrict)
;

create table TelefonosEmpresa(
	id_empresa int, 
	telefono varchar(100),
	PRIMARY KEY (id_empresa,telefono),
	foreign key (id_empresa) references Empresas(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE
);

create table TelefonosProveedores(
	
	rif varchar(100),
	telefono varchar(100),
	PRIMARY KEY(rif,telefono),
	foreign key (rif) references Proveedores(rif)
		ON UPDATE RESTRICT
		ON DELETE CASCADE
);




