import React, { useState, useEffect, useRef } from "react";

export default function App() {
  const [pantalla, setPantalla] = useState("inicio");
  const [nombre, setNombre] = useState("");
  const [tiempo, setTiempo] = useState(300); // 5 minutos
  const [actividad, setActividad] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [vidas, setVidas] = useState(3);
  const [aciertos, setAciertos] = useState(0); // NUEVO

  // --- AUDIO (tiempo, aciertos y errores) ---
  const audioCtxRef = useRef(null);

  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  const playTone = (freq, duration = 0.12, type = "sine", gain = 0.08) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + duration);
  };

  const playTick = () => playTone(1200, 0.03, "square", 0.02);
  const playCorrect = () => playTone(900, 0.15, "sine", 0.05);
  const playIncorrect = () => playTone(200, 0.25, "sawtooth", 0.12);
  const playAlarm = () => {
    let i = 0;
    const id = setInterval(() => {
      playTone(300 + (i % 2) * 150, 0.12, "square", 0.15);
      i++;
      if (i > 9) clearInterval(id);
    }, 180);
  };

  // --- ACTIVIDADES (8) ---
  const actividades = [
    { pregunta: "¿Qué almacena un capacitor?", opciones: ["Energía magnética", "Carga eléctrica", "Energía renovable"], respuesta: 1 },
    { pregunta: "La unidad de capacitancia es:", opciones: ["Henry", "Ohm", "Farad"], respuesta: 2 },
    { pregunta: "¿Qué pasa si conectas capacitores en serie?", opciones: ["La capacitancia disminuye", "La capacitancia aumenta", "La tensión se apaga"], respuesta: 0 },
    { pregunta: "Un capacitor en DC se comporta como:", opciones: ["Corto circuito", "Circuito abierto", "Resistencia variable"], respuesta: 1 },
    { pregunta: "Si aumenta el área de las placas, la capacitancia:", opciones: ["Disminuye", "Aumenta", "Da igual"], respuesta: 1 },
    { pregunta: "Un capacitor bloquea:", opciones: ["El voltaje AC", "La corriente DC", "Todo tipo de corriente"], respuesta: 1 },
    { pregunta: "¿Qué determina la cantidad de carga almacenada?", opciones: ["La frecuencia", "La capacitancia y voltaje", "El largo del cable"], respuesta: 1 },
    { pregunta: "¿Cuál material se usa entre las placas?", opciones: ["Aire o dieléctrico", "Madera", "Arena fina"], respuesta: 0 }
  ];

  // --- TIMER ---
  useEffect(() => {
    if (pantalla !== "juego") return;

    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      try { audioCtxRef.current.resume(); } catch (e) {}
    }

    const intervalo = setInterval(() => {
      setTiempo((t) => {
        const next = t - 1;
        if (t > 0) playTick();
        if (next === 15) playAlarm();
        if (next <= 0) return 0;
        return next;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [pantalla]);

  useEffect(() => {
    if (tiempo === 0 && pantalla === "juego") {
      setPantalla("fin");
      setResultado("Se acabó el tiempo.");
    }
  }, [tiempo, pantalla]);

  // --- RESPUESTAS ---
  function seleccionarRespuesta(index) {
    const correcta = index === actividades[actividad].respuesta;

    if (correcta) {
      playCorrect();
      setAciertos((a) => a + 1);

      if (actividad + 1 < actividades.length) {
        setActividad(actividad + 1);
      } else {
        setPantalla("fin");

        // Mensaje de experto o sigue intentando
        if (aciertos + 1 === 8) {
          setResultado("⭐ ¡ERES UN EXPERTO EN CAPACITORES! ⭐");
        } else {
          setResultado("Sigue intentando, puedes mejorar.");
        }
      }
    } else {
      playIncorrect();

      setVidas((v) => {
        if (v - 1 <= 0) {
          setPantalla("fin");
          setResultado("Perdiste todas tus vidas.");
          return 0;
        }
        return v - 1;
      });

      setResultado("Respuesta incorrecta, pierdes una vida.");
      setTimeout(() => setResultado(null), 1500);
    }
  }

  function empezarJuego() {
    if (!nombre.trim()) {
      setResultado("Escribe tu nombre para comenzar");
      setTimeout(() => setResultado(null), 1200);
      return;
    }
    setVidas(3);
    setTiempo(300);
    setActividad(0);
    setAciertos(0);
    setResultado(null);
    setPantalla("juego");
  }

  return (
    <div
      style={{
        fontFamily: "Arial",
        minHeight: "100vh",
        padding: 20,
        backgroundImage:
          "url('https://i.imgur.com/EwqjBqP.jpeg')", // 🔥 fondo estilo pantalla rota / glitch
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
        textShadow: "0 0 6px black"
      }}
    >
      <div style={{ maxWidth: 700, margin: "auto", background: "rgba(0,0,0,0.55)", padding: 20, borderRadius: 12 }}>

        {pantalla === "inicio" && (
          <>
            <h1>Escape Room: Capacitores ⚡</h1>
            <p>Completa las 8 actividades antes de que el tiempo termine.</p>

            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Escribe tu nombre"
              style={{
                width: "100%",
                padding: 12,
                fontSize: 16,
                borderRadius: 8,
                border: "none",
                marginBottom: 12
              }}
            />

            <button
              onClick={empezarJuego}
              style={{
                padding: "12px 18px",
                fontSize: 16,
                cursor: "pointer",
                width: "100%",
                borderRadius: 8
              }}
            >
              Comenzar
            </button>

            {resultado && <p style={{ marginTop: 15, color: "#ff8080" }}>{resultado}</p>}
          </>
        )}

        {pantalla === "juego" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <strong>{nombre}</strong>
                <p>Actividad {actividad + 1} / {actividades.length}</p>
              </div>

              <div style={{ textAlign: "right" }}>
                <p>Tiempo: {Math.floor(tiempo/60)}:{String(tiempo%60).padStart(2, "0")}</p>
                <p>❤️ Vidas: {vidas}</p>
              </div>
            </div>

            <h2>{actividades[actividad].pregunta}</h2>

            {actividades[actividad].opciones.map((op, i) => (
              <button
                key={i}
                onClick={() => seleccionarRespuesta(i)}
                style={{
                  margin: "8px 0",
                  width: "100%",
                  padding: 12,
                  fontSize: 16,
                  borderRadius: 6,
                  cursor: "pointer",
                  border: "none"
                }}
              >
                {op}
              </button>
            ))}

            {resultado && <p style={{ color: "salmon", marginTop: 10 }}>{resultado}</p>}
          </>
        )}

        {pantalla === "fin" && (
          <>
            <h1>¡Juego terminado, {nombre}!</h1>
            <p>{resultado}</p>

            <h2>Calificación: {aciertos} / 8</h2>

            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 18px",
                fontSize: 16,
                width: "100%",
                cursor: "pointer",
                borderRadius: 8
              }}
            >
              Volver a jugar
            </button>
          </>
        )}

      </div>
    </div>
  );
}
