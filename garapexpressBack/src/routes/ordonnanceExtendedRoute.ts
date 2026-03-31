import { Router } from "express";
import { upload, uploadDir } from "../middleware/upload";
import fs from "fs";

const router = Router();

// Endpoint pour uploader une ordonnance
router.post("/upload", upload.single("fichier"), async (req, res) => {
    try {
        console.log('Upload request received');
        console.log('Files:', req.file);
        console.log('Body:', req.body);
        
        if (!req.file) {
            res.status(400).json({ 
                success: false, 
                error: "Aucun fichier sélectionné. Veuillez sélectionner une image ou un PDF." 
            });
            return;
        }

        // Vérifier que le fichier a bien été sauvegardé
        const filePath = `${uploadDir}/${req.file.filename}`;
        if (!fs.existsSync(filePath)) {
            console.error('File not found at:', filePath);
            res.status(500).json({ 
                success: false, 
                error: "Erreur lors de la sauvegarde du fichier" 
            });
            return;
        }

        console.log('File uploaded successfully:', req.file.filename);
        
        res.json({
            success: true,
            message: "Ordonnance uploadée avec succès",
            data: {
                fichier: `/uploads/${req.file.filename}`,
                dateEmission: new Date().toISOString(),
                statut: "en_attente"
            }
        });
    } catch (error: any) {
        console.error("Erreur upload:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message || "Erreur lors de l'upload" 
        });
    }
});

// Rechercher des médicaments sur une ordonnance (simulation OCR)
router.post("/analyser", async (req, res) => {
    try {
        const { fichier } = req.body;
        
        // Simulation de l'analyse OCR
        // Dans une vraie application, vous utiliseriez un service comme Google Cloud Vision ou AWS Textract
        const medicamentsTrouves = [
            { nom: "Doliprane", DCI: "Paracétamol", dosage: "1000mg" },
            { nom: "Smecta", DCI: "Smectite", dosage: "3g" }
        ];

        res.json({
            success: true,
            data: {
                medicaments: medicamentsTrouves,
                message: "Analyse terminée (simulation)"
            }
        });
    } catch (error) {
        console.error("Erreur analyse:", error);
        res.status(500).json({ 
            success: false, 
            error: "Erreur lors de l'analyse" 
        });
    }
});

export default router;
