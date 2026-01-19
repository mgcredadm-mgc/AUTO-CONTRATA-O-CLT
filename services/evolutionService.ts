
import { EvolutionConfig } from "../types";

const getStoredConfig = (): EvolutionConfig | null => {
  const stored = localStorage.getItem('evolution_config');
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
};

export const EvolutionService = {
  /**
   * Verifica o status da instância
   */
  checkConnection: async (): Promise<{ status: string; qrcode?: string }> => {
    const config = getStoredConfig();
    
    // Se não tiver config
    if (!config) return { status: 'CONFIG_MISSING' };

    // Se estiver no modo Web (QR Code local simulado)
    if (config.mode === 'web') {
        if (config.webConnected) {
            return { status: 'connected' };
        } else {
            return { status: 'disconnected' };
        }
    }

    // Se estiver no modo API (Evolution)
    if (!config.baseUrl || !config.apiKey) {
      return { status: 'CONFIG_MISSING' };
    }

    try {
      const response = await fetch(`${config.baseUrl}/instance/connectionState/${config.instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': config.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Falha ao conectar Evolution API');
      
      const data = await response.json();
      return { status: data.instance?.state || data.state || 'UNKNOWN' };
    } catch (error) {
      console.error('Evolution API Error:', error);
      return { status: 'ERROR' };
    }
  },

  /**
   * Envia mensagem de texto
   */
  sendMessage: async (number: string, text: string): Promise<boolean> => {
    const config = getStoredConfig();
    if (!config) return false;

    // Simulação no modo WEB
    if (config.mode === 'web') {
        if (config.webConnected) {
            console.log(`[Web Mode] Mensagem enviada para ${number}: ${text}`);
            return true;
        } else {
            console.warn('[Web Mode] WhatsApp desconectado.');
            return false;
        }
    }

    // Modo API
    if (!config.baseUrl || !config.apiKey) return false;

    try {
      const url = `${config.baseUrl}/message/sendText/${config.instanceName}`;
      
      const payload = {
        number: number,
        options: {
          delay: 1200,
          presence: "composing",
          linkPreview: true
        },
        textMessage: {
          text: text
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) return false;
      return true;
    } catch (error) {
      console.error('Erro de rede Evolution API:', error);
      return false;
    }
  },

  /**
   * Envia Áudio (Gravado)
   */
  sendWhatsAppAudio: async (number: string, base64Audio: string): Promise<boolean> => {
    const config = getStoredConfig();
    if (!config) return false;

    if (config.mode === 'web') {
        if (config.webConnected) {
            console.log(`[Web Mode] Áudio enviado para ${number}`);
            return true;
        }
        return false;
    }

    if (!config.baseUrl || !config.apiKey) return false;

    try {
      const url = `${config.baseUrl}/message/sendWhatsAppAudio/${config.instanceName}`;
      
      const payload = {
        number: number,
        options: {
          delay: 0,
          presence: "recording",
          encoding: true 
        },
        audioMessage: {
          audio: base64Audio
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      return response.ok;
    } catch (error) {
      console.error('Erro envio Áudio Evolution API:', error);
      return false;
    }
  },

  /**
   * Envia Arquivo/Mídia Genérica
   */
  sendMedia: async (number: string, base64Media: string, fileName: string, mimeType: string, caption: string = ""): Promise<boolean> => {
    const config = getStoredConfig();
    if (!config) return false;

    if (config.mode === 'web') {
        if (config.webConnected) {
             console.log(`[Web Mode] Arquivo enviado para ${number}: ${fileName}`);
             return true;
        }
        return false;
    }

    if (!config.baseUrl || !config.apiKey) return false;

    try {
      const url = `${config.baseUrl}/message/sendMedia/${config.instanceName}`;
      
      const payload = {
        number: number,
        options: {
          delay: 0,
          presence: "composing"
        },
        mediaMessage: {
          mediatype: "document",
          fileName: fileName,
          media: base64Media,
          caption: caption,
          mimetype: mimeType
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      return response.ok;
    } catch (error) {
      console.error('Erro envio Mídia Evolution API:', error);
      return false;
    }
  }
};
