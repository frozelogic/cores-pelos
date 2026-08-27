/// <reference path="types/jquery/index.d.ts" />
/// <reference path="./pelo.ts" />

namespace Seletor {
  let canvasCtx: CanvasRenderingContext2D;

  export let quantPelos: string = "?";
  export let pelosCarregados: number = 0;

  function iniciar(): void {
    canvasCtx = document
      .getElementById("peloAtual")
      .getElementsByTagName("canvas")[0]
      .getContext("2d")!;

    jQuery
      .ajax({ url: `pelos.xml?${new Date().getTime()}` })
      .done((resposta: XMLDocument) => {
        if (!resposta) return;

        const xml: JQuery = $(resposta);
        quantPelos = xml.find("pelo").length.toString();

        xml.find("pelo").each((_index: number, item: HTMLElement) => {
          const img: string = item.getAttribute("src")!;
          const pelo: Seletor.Pelo = new Seletor.Pelo(img);
          document.getElementById("listaPelos")!.appendChild(pelo.elem);
        });
      });

    canvasCtx.canvas.addEventListener("mousemove", canvasMouseMove);
    canvasCtx.canvas.addEventListener("click", canvasMouseClick);
    document
      .getElementById("corAtual")!
      .addEventListener("mousemove", canvasMouseMove);

    canvasCtx.canvas.addEventListener("mouseleave", () => {
      document.getElementById("corAtual")!.style.display = "none";
    });

    const campoHex = document.getElementById("campoHex") as HTMLInputElement;
    campoHex.addEventListener("click", campoHex.select);

    const peloAtualT = document
      .getElementById("peloAtual")!
      .getElementsByTagName("t")[0];
    const isPortuguese = navigator.language.indexOf("pt") === 0;
    peloAtualT.innerHTML = isPortuguese
      ? "Clique sobre o local desejado para capturar a cor."
      : "Use the mouse cursor to capture the color you want.";
  }

  window.addEventListener("load", iniciar);

  export function desenharNoCanvas(imagem: HTMLImageElement): void {
    document.getElementById("peloAtual")!.style.visibility = "visible";
    canvasCtx.clearRect(0, 0, 55555, 55555);
    drawImageProp(canvasCtx, imagem as Seletor.IImagemPelo, 0, 0, 233, 266);
  }

  function drawImageProp(
    ctx: CanvasRenderingContext2D,
    img: Seletor.IImagemPelo,
    x?: number,
    y?: number,
    w?: number,
    h?: number,
    offsetX?: number,
    offsetY?: number
  ): void {
    if (arguments.length === 2) {
      x = 0;
      y = 0;
      w = ctx.canvas.width;
      h = ctx.canvas.height;
    }

    offsetX = offsetX ?? 0.5;
    offsetY = offsetY ?? 0.5;

    offsetX = Math.max(0, Math.min(1, offsetX));
    offsetY = Math.max(0, Math.min(1, offsetY));

    const iw = img.width;
    const ih = img.height;
    let r = Math.min(w! / iw, h! / ih);
    let nw = iw * r;
    let nh = ih * r;
    let ar = 1;

    if (nw < w!) ar = w! / nw;
    if (nh < h!) ar = h! / nh;

    nw *= ar;
    nh *= ar;

    let cw = iw / (nw / w!);
    let ch = ih / (nh / h!);
    let cx = (iw - cw) * offsetX;
    let cy = (ih - ch) * offsetY;

    cx = Math.max(0, cx);
    cy = Math.max(0, cy);
    cw = Math.min(iw, cw);
    ch = Math.min(ih, ch);

    ctx.drawImage(img, cx, cy, cw, ch, x!, y!, w!, h!);
  }

  function canvasMouseMove(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (target.tagName.toLowerCase() === "span") {
      target.style.left = target.offsetLeft + 2 + "px";
      target.style.top = target.offsetTop + 2 + "px";
      return;
    }

    const data = canvasCtx.getImageData(
      event.offsetX,
      event.offsetY,
      1,
      1
    ).data;

    if (data[3] === 0) {
      canvasCtx.canvas.style.cursor = "default";
      document.getElementById("corAtual")!.style.display = "none";
      return;
    }

    canvasCtx.canvas.style.cursor = "crosshair";

    const hex =
      "#" +
      ((1 << 24) + (data[0] << 16) + (data[1] << 8) + data[2])
        .toString(16)
        .slice(1);

    const corAtual = document.getElementById("corAtual")!;
    corAtual.style.display = "block";
    corAtual.style.backgroundColor = hex;
    corAtual.style.left = event.offsetX + 4 + "px";
    corAtual.style.top = event.offsetY + 4 + "px";
  }

  function canvasMouseClick(event: MouseEvent): void {
    const data = canvasCtx.getImageData(
      event.offsetX,
      event.offsetY,
      1,
      1
    ).data;
    const campoHex = document.getElementById("campoHex") as HTMLInputElement;

    if (data[3] === 0) {
      campoHex.value = "";
    } else {
      const hex =
        "#" +
        ((1 << 24) + (data[0] << 16) + (data[1] << 8) + data[2])
          .toString(16)
          .slice(1);

      const peloAtualCor = document
        .getElementById("peloAtual")!
        .getElementsByClassName("cor")[0] as HTMLElement;
      peloAtualCor.style.backgroundColor = hex;

      campoHex.value = hex;
      campoHex.select();
      campoHex.focus();
    }
  }
}
