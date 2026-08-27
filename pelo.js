var Seletor = (function (Seletor) {
  function base64Encode(str) {
    const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let out = "";
    let i = 0;
    const len = str.length;

    while (i < len) {
      const c1 = str.charCodeAt(i++) & 0xff;

      if (i === len) {
        out += CHARS.charAt(c1 >> 2);
        out += CHARS.charAt((c1 & 0x3) << 4);
        out += "==";
        break;
      }

      const c2 = str.charCodeAt(i++);

      if (i === len) {
        out += CHARS.charAt(c1 >> 2);
        out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
        out += CHARS.charAt((c2 & 0xf) << 2);
        out += "=";
        break;
      }

      const c3 = str.charCodeAt(i++);
      out += CHARS.charAt(c1 >> 2);
      out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
      out += CHARS.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6));
      out += CHARS.charAt(c3 & 0x3f);
    }

    return out;
  }

  Seletor.base64Encode = base64Encode;

  class PeloLoader {
    constructor(imagem, oncomplete) {
      jQuery.ajax({
        url: imagem,
        dataType: "text",
        mimeType: "text/plain; charset=x-user-defined",
        crossDomain: true,
        success: (data, status, xhr) => {
          oncomplete(null, data, xhr.getResponseHeader("content-type"));
        },
        error: (xhr, textStatus, errorThrow) => {
          oncomplete(errorThrow, null);
        },
      });
    }
  }

  Seletor.PeloLoader = PeloLoader;

  class Pelo {
    static CORS_ANONYMOUS = "Anonymous";
    static CORS_NONE = "";

    constructor(url) {
      this.tamanho = {};
      this.elem = document.createElement("div");
      this.elem.className = "pelo";

      new PeloLoader(url, (erro, data, tipo) => {
        this.imagem = new Image();
        this.imagem.className = "img-pelo";
        this.imagem.onload = () => this.imagemCarregada();
        this.imagem.onerror = (e) => this.erroCarregamento(e);

        if (data) {
          this.imagem.src = `data:${tipo};base64,${base64Encode(data)}`;
        } else {
          this.imagem.crossOrigin = "Anonymous";
          this.imagem.src = url;
        }
      });
    }

    carregar(url, crossOrigin = "") {}

    erroCarregamento(e) {
      console.log(`cors: ${e.target.crossOrigin}`);

      if (e.target.crossOrigin === Pelo.CORS_ANONYMOUS) {
        this.carregar(e.target.src, Pelo.CORS_NONE);
      } else {
        this.elem.innerHTML =
          '<span style="display: block; font-size: 18px; color: coral; text-align: center; word-wrap: break-word">Error</span>';
        this.elem.style.visibility = "visible";
        this.elem.style.opacity = "1";
      }
    }

    imagemCarregada() {
      Seletor.pelosCarregados++;

      const listaPelos = document.getElementById("listaPelos");
      const t2Element = listaPelos?.getElementsByTagName("t2")[0];

      if (t2Element) {
        const isPortuguese = navigator.language.indexOf("pt") === 0;
        t2Element.innerHTML = isPortuguese
          ? `${Seletor.pelosCarregados} pelos carregados de ${Seletor.quantPelos}`
          : `Loaded ${Seletor.pelosCarregados} of ${Seletor.quantPelos} furs`;
      }

      this.tamanho.height = this.imagem.height;
      this.tamanho.width = this.imagem.width;

      this.imagemDesenho = new Image();
      this.imagemDesenho.className = "img-desenho";
      this.imagemDesenho.src = this.imagem.src;

      this.elem.appendChild(this.imagemDesenho);
      this.imagem.pelo = this;
      this.elem.appendChild(this.imagem);

      this.elem.style.cursor = "hand";
      this.elem.style.visibility = "visible";
      this.elem.style.opacity = "1";

      this.elem.onclick = () => {
        Seletor.desenharNoCanvas(this.imagemDesenho);
      };
    }
  }

  Seletor.Pelo = Pelo;

  return Seletor;
})(Seletor || {});
