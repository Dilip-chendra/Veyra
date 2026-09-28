import { WebSocket } from 'ws';

async function testRelayAudioRoundtrip() {
  console.log('1. Generating test speech from Cartesia Sonic-3.6...');
  const directTTS = await fetch('https://api.cartesia.ai/tts/sse', {
    method: 'POST',
    headers: {
      'X-API-Key': 'sk_car_6iPS2Q73YiohjWpeNHHM8t',
      'Cartesia-Version': '2024-06-10',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model_id: 'sonic-3.6',
      transcript: 'I deployed a Redis caching layer to reduce query latency by 40 percent.',
      voice: 'c0f43c66-9f21-4034-b485-8f1d3340d759',
      output_format: { container: 'raw', encoding: 'pcm_s16le', sample_rate: 16000 }
    })
  });

  const directText = await directTTS.text();
  const pcm16Chunks = [];
  for (const line of directText.split('\n')) {
    if (line.startsWith('data:')) {
      try {
        const json = JSON.parse(line.slice(5).trim());
        if (json.data) {
          pcm16Chunks.push(Buffer.from(json.data, 'base64'));
        }
      } catch(e) {}
    }
  }
  const speechAudio = Buffer.concat(pcm16Chunks);
  console.log('Generated speech audio bytes:', speechAudio.length);

  console.log('2. Connecting to local relay ws://localhost:3000/api/cartesia/stt-relay ...');
  const ws = new WebSocket('ws://localhost:3000/api/cartesia/stt-relay');

  ws.on('open', () => {
    console.log('Relay WS open. Waiting for ready event...');
  });

  ws.on('message', async (data) => {
    const msg = JSON.parse(data.toString());
    console.log('--> Relay Event:', msg.type, msg.transcript || '');

    if (msg.type === 'ready') {
      console.log('Relay is ready! Streaming speech audio through relay...');
      const chunkSize = 3200; // 100ms
      for (let offset = 0; offset < speechAudio.length; offset += chunkSize) {
        ws.send(speechAudio.subarray(offset, offset + chunkSize));
        await new Promise(r => setTimeout(r, 70));
      }
      console.log('Speech stream completed. Sending 2s of silence...');
      const silence = Buffer.alloc(3200 * 20);
      for (let offset = 0; offset < silence.length; offset += chunkSize) {
        ws.send(silence.subarray(offset, offset + chunkSize));
        await new Promise(r => setTimeout(r, 100));
      }
      console.log('Silence completed. Waiting for final turn events...');
      setTimeout(() => ws.close(), 3000);
    }
  });

  ws.on('close', (c, r) => console.log('Relay WS closed:', c, r.toString()));
  ws.on('error', (e) => console.log('Relay WS error:', e.message));
}

testRelayAudioRoundtrip();
