// Fórmula de precificação do frete — valores configuráveis via env vars
// (Vercel → Settings → Environment Variables), sem precisar de deploy de
// código para ajustar preço. Usado tanto por calcular-frete.js (cotação
// antes do pedido) quanto por criar-pedido.js (revalidação no servidor).

export function calcularValorFrete(distanciaKm) {
  const base = Number(process.env.FRETE_TAXA_BASE ?? 5);
  const porKm = Number(process.env.FRETE_VALOR_POR_KM ?? 1.5);
  const minimo = Number(process.env.FRETE_MINIMO ?? 8);
  const valor = base + distanciaKm * porKm;
  return Math.round(Math.max(minimo, valor) * 100) / 100;
}

export function getRaioMaximoKm() {
  return Number(process.env.FRETE_RAIO_MAXIMO_KM ?? 15);
}

export function getOrigemLoja() {
  return {
    lat: Number(process.env.LOJA_ENDERECO_LAT ?? -23.5277),
    lng: Number(process.env.LOJA_ENDERECO_LNG ?? -46.9042),
  };
}

// Geocodifica um endereço em texto para {lat, lng} usando o endpoint de
// geocoding do OpenRouteService (Pelias), mesma API key usada para o
// cálculo de rota — evita depender de mais um serviço externo.
export async function geocodificarEndereco(enderecoTexto) {
  const url = new URL('https://api.openrouteservice.org/geocode/search');
  url.searchParams.set('api_key', process.env.ORS_API_KEY);
  url.searchParams.set('text', enderecoTexto);
  url.searchParams.set('boundary.country', 'BR');
  url.searchParams.set('size', '1');

  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Geocoding falhou: HTTP ${resp.status}`);
  }
  const data = await resp.json();
  const feature = data?.features?.[0];
  if (!feature) {
    throw new Error('Endereço não encontrado');
  }
  const [lng, lat] = feature.geometry.coordinates;
  return { lat, lng };
}

// Calcula a distância de rota real (não linha reta) entre a loja e o
// destino, usando o perfil "driving-car" do ORS (não existe perfil
// dedicado para moto — driving-car é a aproximação correta de rota
// urbana por vias, mais realista que distância em linha reta).
export async function calcularDistanciaKm(origem, destino) {
  const resp = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
    method: 'POST',
    headers: {
      Authorization: process.env.ORS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coordinates: [
        [origem.lng, origem.lat],
        [destino.lng, destino.lat],
      ],
    }),
  });

  if (!resp.ok) {
    throw new Error(`Cálculo de rota falhou: HTTP ${resp.status}`);
  }
  const data = await resp.json();
  const distanciaMetros = data?.routes?.[0]?.summary?.distance;
  if (typeof distanciaMetros !== 'number') {
    throw new Error('Não foi possível calcular a distância da rota');
  }
  return Math.round((distanciaMetros / 1000) * 100) / 100;
}

// Função de alto nível: recebe um endereço em texto, geocodifica,
// calcula distância real até a loja e retorna a cotação de frete.
// Lança erro com .status = 422 se estiver fora da área de entrega.
export async function cotarFrete(enderecoTexto) {
  const origem = getOrigemLoja();
  const destino = await geocodificarEndereco(enderecoTexto);
  const distanciaKm = await calcularDistanciaKm(origem, destino);

  const raioMaximo = getRaioMaximoKm();
  if (distanciaKm > raioMaximo) {
    const err = new Error(
      `Infelizmente esse endereço está fora da nossa área de entrega (${distanciaKm.toFixed(1)} km, ` +
        `atendemos até ${raioMaximo} km).`
    );
    err.status = 422;
    throw err;
  }

  const valorFrete = calcularValorFrete(distanciaKm);
  return { distancia_km: distanciaKm, valor_frete: valorFrete, meio_entrega: 'moto', lat: destino.lat, lng: destino.lng };
}
