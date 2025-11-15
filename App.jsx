import React, { useState, useEffect, useRef } from "react";

export default function App() {
  const [pantalla, setPantalla] = useState("inicio");
  const [nombre, setNombre] = useState("");
  const [tiempo, setTiempo] = useState(300); // 5 minutos
  const [actividad, setActividad] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [vidas, setVidas] = useState(3);
  const [aciertos, setAciertos] = useState(0);

  // --- AUDIO ---
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

  // --- ACTIVIDADES (Transformadores) ---
  const actividades = [
    { 
      pregunta: "¿Qué ley explica el principio de funcionamiento de un transformador?", 
      opciones: ["Ley de Coulomb", "Ley de Faraday", "Ley de Ohm"], 
      respuesta: 1 
    },
    { 
      pregunta: "Los transformadores solo funcionan con:", 
      opciones: ["Corriente directa (DC)", "Corriente alterna (AC)", "Ambas"], 
      respuesta: 1 
    },
    { 
      pregunta: "La relación entre el número de espiras y el voltaje se llama:", 
      opciones: ["Relación de transformación", "Relación de impedancia", "Relación de potencia"], 
      respuesta: 0 
    },
    { 
      pregunta: "El núcleo de un transformador está hecho de:", 
      opciones: ["Aluminio puro", "Hierro o acero al silicio", "Cobre sólido"], 
      respuesta: 1 
    },
    { 
      pregunta: "Un transformador elevador (step-up) hace que el voltaje:", 
      opciones: ["Disminuya", "Aumente", "Permanezca igual"], 
      respuesta: 1 
    },
    { 
      pregunta: "Las pérdidas en el cobre del transformador se deben a:", 
      opciones: ["Corrientes parásitas", "Resistencia en los devanados", "Fuga de flujo magnético"], 
      respuesta: 1 
    },
    { 
      pregunta: "¿Qué mide un transformador de corriente (TC)?", 
      opciones: ["Voltaje en alta tensión", "Corrientes elevadas de forma segura", "Resonancia magnética"], 
      respuesta: 1 
    },
    { 
      pregunta: "¿Qué provoca que un transformador haga ruido (humming)?", 
      opciones: ["La vibración del núcleo por magnetoestricción", "Fallas eléctricas internas", "El movimiento del aceite"], 
      respuesta: 0 
    }
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
        if (aciertos + 1 === 8) {
          setResultado("⭐ ¡ERES UN EXPERTO EN TRANSFORMADORES! ⭐");
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
          "url('https://i.imgur.com/EwqjBqP.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
        textShadow: "0 0 6px black"
      }}
    >
      <div style={{ maxWidth: 700, margin: "auto", background: "rgba(0,0,0,0.55)", padding: 20, borderRadius: 12 }}>

        {pantalla === "inicio" && (
          <>
            <h1>Escape Room: Transformadores. Equipo 5 ⚡</h1>
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
