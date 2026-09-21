import supabase from "../services/supabase.js";

const calcularEstadoProducto = (stock) => {

  return stock === 0
    ? "AGOTADO"
    : "DISPONIBLE";

};

export const listarProductos = async (req, res) => {
  try {

    // ==========================
    // PRODUCTOS
    // ==========================
    const { data: productos, error } = await supabase
      .schema("catalogo")
      .from("producto")
      .select("*")
      .eq("estado_producto", "DISPONIBLE");

    if (error) {
      return res.status(400).json(error);
    }

    // ==========================
    // AGREGAR CATEGORIA Y NEGOCIO
    // ==========================
    const productosCompletos = await Promise.all(

      productos.map(async (producto) => {

        // Categoría
        const { data: categoria } = await supabase
          .schema("catalogo")
          .from("categoria")
          .select("id_categoria, nombre_categoria")
          .eq("id_categoria", producto.id_categoria)
          .single();

        // Negocio
        const { data: negocio } = await supabase
          .schema("negocio")
          .from("negocio")
          .select("id_negocio, nombre_negocio, logo")
          .eq("id_negocio", producto.id_negocio)
          .single();

        return {
          ...producto,
          categoria,
          nombre_negocio: negocio?.nombre_negocio,
          logo: negocio?.logo,
          negocio
        };

      })

    );

    res.json(productosCompletos);

  } catch (error) {

    console.error(error);
    res.status(500).json(error);

  }
};

export const obtenerProductoPorId = async (req, res) => {

    try {

        const { id } = req.params;

        // ==========================
        // PRODUCTO
        // ==========================

        const { data: producto, error } = await supabase
            .schema("catalogo")
            .from("producto")
            .select("*")
            .eq("id_producto", id)
            .single();

        if (error || !producto) {

            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });

        }

        // ==========================
        // CATEGORIA
        // ==========================

        const { data: categoria } = await supabase
            .schema("catalogo")
            .from("categoria")
            .select(`
                id_categoria,
                nombre_categoria
            `)
            .eq("id_categoria", producto.id_categoria)
            .single();

        // ==========================
        // NEGOCIO
        // ==========================

        const { data: negocio } = await supabase
            .schema("negocio")
            .from("negocio")
            .select(`
                id_negocio,
                nombre_negocio,
                logo
            `)
            .eq("id_negocio", producto.id_negocio)
            .single();

        res.json({

            ...producto,

            categoria,

            negocio

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json(error);

    }

};

export const obtenerMisProductos = async (req, res) => {

  try {

    const { data: negocio } = await supabase
      .schema("negocio")
      .from("negocio")
      .select("id_negocio")
      .eq("id_perfil", req.user.id)
      .single();

    if (!negocio) {

      return res.status(404).json({
        mensaje: "No tienes un negocio registrado."
      });

    }

    const { data, error } = await supabase
      .schema("catalogo")
      .from("producto")
      .select(`
        *,
        categoria(*)
      `)
      .eq(
        "id_negocio",
        negocio.id_negocio
      );

    if (error) {

      return res.status(400).json(error);

    }

    res.json(data);

  } catch (error) {

    res.status(500).json(error);

  }

};

export const crearProducto = async (req, res) => {
  try {
    const {
      id_negocio,
      id_categoria,
      nombre_producto,
      descripcion,
      caracteristicas,
      stock,
      precio,
      imagen
    } = req.body;

    if (stock < 0) {
      return res.status(400).json({
        mensaje: "El stock no puede ser negativo"
      });
    }

    const { data: negocio } = await supabase
      .schema("negocio")
      .from("negocio")
      .select("id_negocio")
      .eq("id_negocio", id_negocio)
      .eq("id_perfil", req.user.id)
      .single();

    if (!negocio) {

      return res.status(403).json({
        mensaje: "No puedes crear productos para este negocio."
      });

    }

    const estado_producto =
      calcularEstadoProducto(
        stock
      );

    const { data, error } = await supabase
      .schema("catalogo")
      .from("producto")
      .insert([
        {
          id_negocio,
          id_categoria,
          nombre_producto,
          descripcion,
          caracteristicas,
          stock,
          precio,
          imagen,
          estado_producto
        }
      ])
      .select();

    if (error) {
      return res.status(400).json(error);
    }

    res.status(201).json(data);

  } catch (error) {
    res.status(500).json(error);
  }
};

export const actualizarProducto = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      id_categoria,
      nombre_producto,
      descripcion,
      caracteristicas,
      stock,
      precio,
      imagen
    } = req.body;

    if (stock < 0) {

      return res.status(400).json({
        mensaje: "El stock no puede ser negativo"
      });

    }

    // ============================
    // BUSCAR EL PRODUCTO
    // ============================

    const { data: producto } = await supabase
      .schema("catalogo")
      .from("producto")
      .select(`
        id_producto,
        id_negocio
      `)
      .eq("id_producto", id)
      .single();

    if (!producto) {

      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });

    }

    // ============================
    // VALIDAR QUE EL NEGOCIO ES DEL VENDEDOR
    // ============================

    const { data: negocio } = await supabase
      .schema("negocio")
      .from("negocio")
      .select("id_negocio")
      .eq("id_negocio", producto.id_negocio)
      .eq("id_perfil", req.user.id)
      .single();

    if (!negocio) {

      return res.status(403).json({
        mensaje: "No puedes modificar este producto"
      });

    }

    // ============================
    // CALCULAR ESTADO
    // ============================

    const estado_producto =
      calcularEstadoProducto(stock);

    // ============================
    // ACTUALIZAR
    // ============================

    const { error } = await supabase
      .schema("catalogo")
      .from("producto")
      .update({
        id_categoria,
        nombre_producto,
        descripcion,
        caracteristicas,
        stock,
        precio,
        imagen,
        estado_producto
      })
      .eq("id_producto", id);

    if (error) {

      return res.status(400).json(error);

    }

    res.json({
      mensaje: "Producto actualizado"
    });

  } catch (error) {

    res.status(500).json(error);

  }

};

export const eliminarProducto = async (req, res) => {

  try {

    const { id } = req.params;

    // ============================
    // BUSCAR EL PRODUCTO
    // ============================

    const { data: producto } = await supabase
      .schema("catalogo")
      .from("producto")
      .select(`
        id_producto,
        id_negocio
      `)
      .eq("id_producto", id)
      .single();

    if (!producto) {

      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });

    }

    // ============================
    // VALIDAR QUE EL NEGOCIO ES DEL VENDEDOR
    // ============================

    const { data: negocio } = await supabase
      .schema("negocio")
      .from("negocio")
      .select("id_negocio")
      .eq("id_negocio", producto.id_negocio)
      .eq("id_perfil", req.user.id)
      .single();

    if (!negocio) {

      return res.status(403).json({
        mensaje: "No puedes eliminar este producto"
      });

    }

    // ============================
    // ELIMINAR
    // ============================

    const { error } = await supabase
      .schema("catalogo")
      .from("producto")
      .delete()
      .eq("id_producto", id);

    if (error) {

      return res.status(400).json(error);

    }

    res.json({
      mensaje: "Producto eliminado"
    });

  } catch (error) {

    res.status(500).json(error);

  }

};