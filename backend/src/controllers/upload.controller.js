import supabase from "../services/supabase.js";
import crypto from "crypto";

export const subirLogo = async (req, res) => {

    try {

        // Verificar que se envió un archivo
        if (!req.file) {
            return res.status(400).json({
                mensaje: "Debe seleccionar una imagen."
            });
        }

        const archivo = req.file;

        // Obtener la extensión del archivo
        const extension = archivo.originalname
            .split(".")
            .pop();

        // Nombre único
        const nombreArchivo =
            `${crypto.randomUUID()}.${extension}`;

        // Subir al bucket
        const { error } = await supabase.storage
            .from("logos-negocios")
            .upload(
                nombreArchivo,
                archivo.buffer,
                {
                    contentType: archivo.mimetype,
                    upsert: false
                }
            );

        if (error) {

            console.error(error);

            return res.status(500).json({
                mensaje: "No fue posible subir el logo.",
                error: error.message
            });

        }

        // Obtener URL pública
        const { data } = supabase.storage
            .from("logos-negocios")
            .getPublicUrl(nombreArchivo);

        return res.status(200).json({

            mensaje: "Logo subido correctamente.",

            url: data.publicUrl

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            mensaje: "Error interno del servidor."

        });

    }

};

export const subirImagenProducto = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                mensaje: "Debe seleccionar una imagen."
            });
        }

        const archivo = req.file;

        const extension = archivo.originalname
            .split(".")
            .pop();

        const nombreArchivo =
            `${crypto.randomUUID()}.${extension}`;

        const { error } = await supabase.storage
            .from("imagenes-productos")
            .upload(
                nombreArchivo,
                archivo.buffer,
                {
                    contentType: archivo.mimetype,
                    upsert: false
                }
            );

        if (error) {

            return res.status(500).json({
                mensaje: "No fue posible subir la imagen.",
                error: error.message
            });

        }

        const { data } = supabase.storage
            .from("imagenes-productos")
            .getPublicUrl(nombreArchivo);

        res.json({
            mensaje: "Imagen subida correctamente",
            url: data.publicUrl
        });

    } catch (error) {

        res.status(500).json({
            mensaje: "Error interno"
        });

    }

};