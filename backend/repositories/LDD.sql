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

create table MARIA.app.Proveedores(

	rif varchar(100) PRIMARY KEY,
	razon_social varchar(200) unique not null, 
	persona_contacto varchar(200) not null,
	email varchar(200) unique not null, 
	descripcion varchar(255)
);

create table MARIA.Empresas(
	id serial PRIMARY KEY,
	email varchar(200) not null unique, 
	nombreComerciar varchar(200) not null, 
	razonSocial varchar(200) unique,
	rif varchar(100) unique, 
	fecha_fundacion date,
	direcion varchar(200) not null, 
	password varchar(255)
);

create table MARIA.Servicios(
	id_empresa INT, 
	nro_servicio INT, 
	nombre varchar(100) not null, 
	descripcion varchar(255),
	plazo date, --debe estar en días 
	precio float check(precio >= 0),
	
	PRIMARY KEY(id_empresa,nro_servicio),
	foreign key(id_empresa) references MARIA.Empresas(id)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT
);

create table MARIA.OrdenCompra(
	nro_orden serial PRIMARY KEY,
	desripcion varchar(255),
	fecha_compra date not null, 
	id_empresa int, 
	rif_proveedor int,
	foreign key (id_empresa) references MARIA.Empresas(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT,
	foreign key (rif_proveedor) references MARIA.Proveedores(rif)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT
);

create table MARIA.Productos(
	id serial primary key, 
	nombre varchar(255) not null, 
	descripcion varchar(255),
	cantidad_minima int check(cantidad_minima >= 0),
	cantidad_maxima int check(cantidad_maxima >= 0),
	precio_venta float check (precio_venta >= 0)
);

create table MARIA.Bancos(
	codigo codigo_banco PRIMARY KEY,
	nombre varchar(100) unique not null
);

create table MARIA.Empleados(
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
	
	foreign key (empresa_trabaja) references MARIA.Empresa(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT,
	foreign key (empresaEncargado) references MARIA.Empresa(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT
);

create table MARIA.Automatizaciones(

	id serial primary key, 
	nombre varchar(255) not null, 
	descripcion varchar(255), 
	jsonString varchar(255), 
	id_empresa int,
	
	foreign key (id_empresa) references MARIA.Empresas(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT
);

create table MARIA.Cientes(

	CI varchar(100) PRIMARY KEY, 
	nombre varchar(100) not null, 
	apellido varchar(100) not null
	email varchar(100),
);

create table MARIA.OrdenVenta(

	nro_orden serial primary key, 
	descripcion varchar(255), 
	fechaVenta date not null, 
	referencia varchar(255) not null unique, 
	ci_cliente varchar(100),
	id_empresa int, 
	
	foreign key (ci_cliente) references MARIA.Clientes(CI)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT,
	foreign key (id_empresa) references MARIA.Empresas(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT
);

create table MARIA.PagoMovil( 
	codigoBanco codigo_banco, 
	cedula_RIF varchar(100), 
	telefono varchar(100),
	
	
	PRIMARY KEY(codigoBanco,cedula_RIF,telefono),
	foreign key(codigoBanco) references MARIA.Bancos(codigo)
		ON UPDATE CASCADE
		ON DELETE RESTRICT
);

create table MARIA.DatosBancarios(
	codigoBanco codigo_banco, 
	nro_cuenta MARIA.NRO_CUENTA,
	
	PRIMARY KEY(codigoBanco,nro_cuenta),
	foreign key(codigoBanco) references MARIA.Bancos(codigo)
		ON UPDATE CASCADE
		ON DELETE RESTRICT
);

create table MARIA.OrdenCompraProducto(
	nro_orden INT, 
	id_producto INT, 
	cantidad int CHECK(cantidad >= 0), 
	precioUnidad float check(precioUnidad >= 0),
	
	PRIMARY KEY(nro_orden,id_producto),
	foreign key (id_producto) references MARIA.Productos(id)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT,
	foreign key nro_orden) references MARIA.OrdenCompra(nro_orden)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT
);

create table MARIA.ProductosServicios(

	id_producto int, 
	id_empresa INT, 
	nro_servicio int,
	cantidad int CHECK(cantidad >= 0), 
	
	PRIMARY KEY(id_producto, id_empresa,nro_servicio),
	foreign key(id_empresa,nro_servicio) references MARIA.Servicios(id_empresa,nro_servicio),
		ON UPDATE RESTRICT
		ON DELETE RESTRICT,
	foreign key(id_producto) references MARIA.Productos(id)	
		ON UPDATE RESTRICT
		ON DELETE RESTRICT
);

create table MARIA.Inventario(

	id_empresa int,
	id_producto int, 
	cantidad_actual int check(cantidad_actual >= 0),
	
	PRIMARY KEY(id_empresa, id_producto),
	foreign key(id_producto) references MARIA.Productos(id)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT,
	foreign key (id_empresa) references MARIA.Empresas(id)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT
);

create domain estadoServicio AS varchar(20)
NOT NULL
check( VALUE IN ('VIGENTE','POR VENCER','VENCIDO'));

create table MARIA.OrdenVentaServicios(

	nro_orden INT, 
	id_empresa int, 
	nro_servicio int, 
	fecha_vencimiento date not null, 
	estado estadoServicio default 'VIGENTE',
	
	PRIMARY KEY(nro_orden,id_empresa,nro_servicio), 
	foreign key(id_empresa,nro_servicio) references MARIA.Servicios(id_empresa,nro_servicio),
		ON UPDATE RESTRICT
		ON DELETE RESTRICT,
	foreign key (nro_orden) references MARIA.OrdenVenta(nro_orden)
		ON UPDATE RESTRICT,
		ON DELETE RESTRICT
);

create table MARIA.OrdenVentaProductos(

	nro_orden int, 
	id_producto int, 
	precio float check (precio >= 0),
	cantidad int check (cantidad >= 0), 
	
	PRIMARY KEY(nro_orden,id_producto),
	foreign key(id_producto) references MARIA.Productos(id)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT,
	foreign key (nro_orden) references MARIA.OrdenVenta(nro_orden)
		ON UPDATE RESTRICT,
		ON DELETE RESTRICT
);

create table MARIA.ClientesEmpresa(

	id_empresa int, 
	ci_cliente varchar(100),
	
	PRIMARY KEY(id_empresa, ci_cliente),
	foreign key (id_empresa) references MARIA.Empresas(id)
		ON UPDATE RESTRICT
		ON DELETE RESTRICT,
	foreign key (ci_cliente) references MARIA.Clientes(CI)
		ON UPDATE RESTRICT,
		ON DELETE RESTRICT
);

create table MARIA.TelefonosCliente(
	ci_cliente varchar(100),
	telefono varchar(100)
	PRIMARY KEY(ci_cliente,telefono),
	foreign key (ci_cliente) references MARIA.Clientes(CI)
		ON UPDATE RESTRICT,
		ON DELETE RESTRICT
;

create table MARIA.TelefonosEmpresa(
	id_empresa int, 
	telefono varchar(100),
	PRIMARY KEY (id_empresa,telefono),
	foreign key (id_empresa) references MARIA.Empresas(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE,
);

create table MARIA.TelefonosProveedores(
	
	rif varchar(100),
	telefono varchar(100),
	PRIMARY KEY(rif,telefono),
	foreign key (rif) references MARIA.Proveedores(rif)
		ON UPDATE RESTRICT,
		ON DELETE CASCADE
);

create table MARIA.DatosBancariosPropietarios(

	nro_cuenta MARIA.NRO_CUENTA,
	cedula_RIF varchar(100),
	PRIMARY KEY(nro_cuenta,cedula_RIF),
	foreign key(nro_cuenta) references MARIA.Bancos(nro_cuenta)
		ON UPDATE RESTRICT
		ON DELETE CASCADE
);

create table MARIA.DatosBancariosEmpresa(
	
	nro_cuenta MARIA.NRO_CUENTA,
	id_empresa INT, 
	foreign key(nro_cuenta) references MARIA.Bancos(nro_cuenta)
		ON UPDATE RESTRICT
		ON DELETE CASCADE,
	foreign key (id_empresa) references MARIA.Empresas(id)
		ON UPDATE RESTRICT
		ON DELETE CASCADE,
);





