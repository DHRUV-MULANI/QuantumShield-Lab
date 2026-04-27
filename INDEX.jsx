import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, User, Cpu, ArrowRight, Activity, Eye, Zap, RefreshCw, Key, Lock, Unlock, AlertTriangle, Cloud, Server, Database, Code, CircleDot, CheckCircle2, Settings } from 'lucide-react';

const TOPICS = [
  { 
    id: 'ntru', 
    name: 'NTRU', 
    type: 'Post-Quantum', 
    cat: 'network',
    logic: "Instead of relying on prime factorization (which quantum computers can break), NTRU uses polynomial rings (complex algebra equations). It's like mixing different colors of paint: easy to mix, but extremely hard to separate without the exact recipe.",
    encryptSteps: [
      "1. Represent the secret message 'm' as a polynomial.",
      "2. Generate a random blinding polynomial 'r' (this acts as noise/salt).",
      "3. Multiply 'r' by the receiver's public key 'h'.",
      "4. Add the message 'm' to get ciphertext: c = p*r*h + m (mod q)."
    ],
    decryptSteps: [
      "1. Multiply the ciphertext 'c' by the private key polynomial 'f'.",
      "2. Use modulo 'q' arithmetic—this cleverly makes the noise drop out.",
      "3. Multiply the result by the inverse of 'f' (mod p) to isolate and recover 'm'."
    ]
  },
  { 
    id: 'fhe', 
    name: 'Fully Homomorphic Encryption', 
    type: 'Cloud Security', 
    cat: 'network',
    logic: "FHE allows a computer (like a cloud server) to perform math directly on encrypted data without ever decrypting it. It's like putting your data inside a locked safe with built-in gloves; the cloud can manipulate the contents, but only you have the key to open it.",
    encryptSteps: [
      "1. Take plaintext data points 'a' and 'b'.",
      "2. Add mathematical noise to both to encrypt them: E(a) and E(b).",
      "3. Send the encrypted data to the cloud."
    ],
    decryptSteps: [
      "1. The cloud performs operations directly: E(result) = E(a) + E(b).",
      "2. The cloud returns E(result). It has no idea what the actual numbers are.",
      "3. You use your private key to strip away the noise and decrypt the final result."
    ]
  },
  { 
    id: 'ecc', 
    name: 'Elliptic Curve Cryptography', 
    type: 'Public Key', 
    cat: 'geometry-ecc',
    logic: "ECC relies on the algebraic structure of elliptic curves. Imagine hitting a billiard ball on a weirdly shaped table where you can track its path forwards easily, but tracing it backward to its starting point is mathematically nearly impossible (Elliptic Curve Discrete Logarithm Problem).",
    encryptSteps: [
      "1. Map your message 'M' to a point on the elliptic curve.",
      "2. Pick a random number 'k'.",
      "3. Compute C1 = k * G (where G is a base point).",
      "4. Compute C2 = M + k * Public_Key. Send (C1, C2)."
    ],
    decryptSteps: [
      "1. Receive the pair (C1, C2).",
      "2. Multiply C1 by your Private_Key.",
      "3. Subtract that result from C2: M = C2 - (Private_Key * C1).",
      "4. You have recovered the point 'M'."
    ]
  },
  { 
    id: 'ecdh', 
    name: 'Elliptic Curve Diffie-Hellman', 
    type: 'Key Exchange', 
    cat: 'network',
    logic: "ECDH isn't for encrypting messages directly; it's a way for Alice and Bob to agree on a secret passcode over a public, eavesdropped channel without ever sending the passcode itself.",
    encryptSteps: [
      "1. Alice picks a random private number 'a'. Computes public A = a * G.",
      "2. Bob picks a random private number 'b'. Computes public B = b * G.",
      "3. Alice and Bob exchange A and B publicly."
    ],
    decryptSteps: [
      "1. Alice computes Secret = a * B.",
      "2. Bob computes Secret = b * A.",
      "3. Both now have the exact same point (a * b * G) to use as a shared master password!"
    ]
  },
  { 
    id: 'hasse', 
    name: "Hasse's Theorem", 
    type: 'ECC Theory', 
    cat: 'geometry-ecc',
    logic: "Not an encryption algorithm, but a fundamental theorem. It tells us roughly how many points exist on a specific elliptic curve over a finite field. If a curve has too few or easily guessable points, it's insecure.",
    encryptSteps: [
      "1. Determine the prime field 'p'.",
      "2. Calculate the estimated number of points: p + 1.",
      "3. Apply Hasse's boundary: the actual number of points 'N' will not deviate by more than 2√p."
    ],
    decryptSteps: [
      "1. Verify that 'N' has a large prime factor.",
      "2. Ensure the curve avoids known mathematical weaknesses.",
      "3. Use this validated curve to generate secure ECC keys."
    ]
  },
  { 
    id: 'cvp', 
    name: 'Closest Vector Problem (CVP)', 
    type: 'Lattice Problem', 
    cat: 'geometry-lattice',
    logic: "Imagine a grid of dots (a lattice). If I drop a pin anywhere on the board (a target vector), CVP asks: 'Which dot is the pin closest to?'. In 2D this is easy, but in 1000-dimensional space, it's NP-Hard to solve.",
    encryptSteps: [
      "1. The message is encoded as a specific dot on the lattice grid.",
      "2. The sender adds a small amount of random 'noise', moving the point slightly off the dot.",
      "3. This new off-grid coordinate is the ciphertext."
    ],
    decryptSteps: [
      "1. The receiver uses a 'good trapdoor' (an orthogonal basis) to easily snap the off-grid point back to the nearest dot.",
      "2. Without the trapdoor, an attacker faces the NP-Hard Closest Vector Problem and gets lost in the dimensions."
    ]
  },
  { 
    id: 'svp', 
    name: 'Shortest Vector Problem (SVP)', 
    type: 'Lattice Problem', 
    cat: 'geometry-lattice',
    logic: "SVP asks: 'What is the shortest possible line you can draw from the center (origin) to any dot in a given lattice?' Like CVP, this is extremely difficult to compute in high dimensions and forms the bedrock of Post-Quantum cryptography.",
    encryptSteps: [
      "1. Used fundamentally to generate secure keys.",
      "2. A lattice is constructed where the shortest vector acts as the private key.",
      "3. A scrambled, twisted version of the lattice is published as the public key."
    ],
    decryptSteps: [
      "1. If an attacker can solve SVP on the public key, they break the system.",
      "2. Because SVP is NP-Hard, no known algorithm (quantum or classical) can find the shortest vector in reasonable time."
    ]
  },
  { 
    id: 'ggh', 
    name: 'GGH Cryptosystem', 
    type: 'Lattice Crypto', 
    cat: 'network',
    logic: "GGH is a practical implementation of the Closest Vector Problem (CVP). It gives Alice a scrambled map (public key) to hide her data, and Bob a clean map (private key) to find it.",
    encryptSteps: [
      "1. Convert message into a vector 'm'.",
      "2. Multiply 'm' by the public 'bad' basis W (highly skewed/angled grid).",
      "3. Add a small error vector 'r'.",
      "4. Ciphertext c = m * W + r."
    ],
    decryptSteps: [
      "1. Bob multiplies 'c' by the inverse of his private 'good' basis V (straight, perpendicular grid).",
      "2. Because V is straight, Bob can easily round the numbers to the nearest integer to remove the noise 'r' (Babai's algorithm).",
      "3. Bob multiplies the rounded result by W's inverse to get the exact message 'm'."
    ]
  }
];

export default function AdvancedCryptoLab() {
  const [activeTopic, setActiveTopic] = useState(TOPICS[0].id);
  const [eveActive, setEveActive] = useState(false);
  const [logs, setLogs] = useState([]);
  
  // Interactive Parameters State
  const [params, setParams] = useState({
    ntru: { m: '1 - x + x^2', r: 'x - x^3', p: 3, q: 32 },
    fhe: { a: 15, b: 27, op: '+' },
    ecc: { M: 'Point(5, 7)', k: 4, privKey: '7' },
    ecdh: { a: 12, b: 7, G: 'G' },
    hasse: { p: 23 },
    cvp: { w: '[5.2, 3.8]' },
    svp: { basis: 'L(v1, v2)' },
    ggh: { m: '[4, -2]', r: '[1, -1]' }
  });

  const handleParamChange = (topic, field, value) => {
    setParams(prev => ({
      ...prev,
      [topic]: {
        ...prev[topic],
        [field]: value
      }
    }));
  };
  
  // Animation States
  const [simState, setSimState] = useState('idle'); // idle, alice_prep, transmitting, intercepting, bob_processing, returning, done
  const [packetPos, setPacketPos] = useState({ x: 100, y: 150 });
  const [packetData, setPacketData] = useState('');

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), msg, type }]);
  };

  const clearLogs = () => setLogs([]);

  // Node Positions for 2D Canvas
  const posAlice = { x: 100, y: 150 };
  const posBob = { x: 600, y: 150 };
  const posEve = { x: 350, y: 250 };

  // --- Core Simulation Logic ---
  const runSimulation = () => {
    if (simState !== 'idle' && simState !== 'done') return;
    clearLogs();
    setSimState('alice_prep');
    setPacketPos(posAlice);

    setTimeout(() => {
      // Step 1: Alice Prepares
      const topic = TOPICS.find(t => t.id === activeTopic);
      const p = params[activeTopic];

      if (activeTopic === 'ntru') {
        addLog(`[WRAPPING] Alice wants to hide m(x) = [${p.m}].`, 'alice');
        addLog(`She adds blinding polynomial r(x) = [${p.r}] and multiplies by Bob's public key 'h'.`, 'alice');
        addLog(`Wrapped Ciphertext: c(x) = ${p.p} * (${p.r}) * h + (${p.m}) mod ${p.q}`, 'alice');
        setPacketData(`c(x)`);
      } else if (activeTopic === 'fhe') {
        addLog(`[WRAPPING] Alice wraps a=${p.a} and b=${p.b} inside mathematical noise.`, 'alice');
        addLog(`E(${p.a}) = ${p.a} + NoiseA  |  E(${p.b}) = ${p.b} + NoiseB`, 'alice');
        setPacketData(`E(${p.a}), E(${p.b})`);
      } else if (activeTopic === 'ecdh') {
        addLog(`[WRAPPING] Alice multiplies base point G by her private secret a=${p.a}.`, 'alice');
        addLog(`Wrapped Public Key: A = ${p.a}G`, 'alice');
        setPacketData(`A = ${p.a}G`);
      } else if (activeTopic === 'ecc') {
        addLog(`[WRAPPING] Alice maps message to M = ${p.M}. She picks random k = ${p.k}.`, 'alice');
        addLog(`She computes C1 = ${p.k}G. This is half the lock.`, 'alice');
        addLog(`She computes C2 = M + k*(PubKey). Since PubKey is PrivKey*G, C2 = ${p.M} + ${p.k}*(PrivKey*G).`, 'alice');
        setPacketData(`(C1, C2)`);
      } else if (activeTopic === 'ggh') {
        addLog(`[WRAPPING] Alice multiplies m=${p.m} by the highly skewed public matrix W.`, 'alice');
        addLog(`She adds noise r=${p.r} to push it off the grid.`, 'alice');
        addLog(`Wrapped Ciphertext: c = ${p.m} * W + ${p.r}`, 'alice');
        setPacketData(`c`);
      } else if (activeTopic === 'hasse') {
        addLog(`Checking curve properties over prime field p=${p.p}.`, 'info');
      }

      setSimState('transmitting');
      
      // Step 2: Transmission & Interception
      setTimeout(() => {
        if (eveActive && topic.cat === 'network') {
          setSimState('intercepting');
          setPacketPos(posEve);
          addLog('Eve intercepts the data packet!', 'eve');
          
          if (activeTopic === 'ntru') {
             addLog(`Eve tries to unwrap c(x). Without Bob's private 'f', the term ${p.p}*r*h + m looks like random noise. Solving this requires breaking the NP-Hard Shortest Vector Problem!`, 'eve');
          } else if (activeTopic === 'fhe') {
             addLog(`Eve sees E(${p.a}) and E(${p.b}). The mathematical noise fully masks the underlying data.`, 'eve');
          } else if (activeTopic === 'ecdh') {
             addLog(`Eve sees A = ${p.a}G. She cannot divide a point by G to find a=${p.a} (Elliptic Curve Discrete Logarithm Problem).`, 'eve');
          } else if (activeTopic === 'ggh') {
             addLog(`Eve tries to unwrap using Babai's closest vector algorithm on the public basis W. The noise ${p.r} gets magnified by the bad grid, causing rounding failure!`, 'eve');
          }
          
          setTimeout(() => {
            setSimState('bob_processing');
            setPacketPos(posBob);
            processBob(p);
          }, 2500);

        } else {
          setSimState('bob_processing');
          setPacketPos(posBob);
          processBob(p);
        }
      }, 1500);
    }, 1000);
  };

  const processBob = (p) => {
    if (activeTopic === 'ntru') {
      addLog(`[UNWRAPPING] Bob multiplies c(x) by his private key polynomial 'f'.`, 'bob');
      addLog(`a = f * c = f * (${p.p} * r * h + m)`, 'bob');
      addLog(`Since f*h is a multiple of q, that entire chunk zeroes out (mod ${p.q})!`, 'bob');
      addLog(`We are left with: a = f * m (mod ${p.q})`, 'bob');
      addLog(`Bob multiplies by f_inverse to isolate m. (f * f_inv) cancels out!`, 'bob');
      addLog(`Message m(x) = [${p.m}] successfully unwrapped!`, 'success');
      setSimState('done');
    } else if (activeTopic === 'fhe') {
      const result = p.op === '+' ? (Number(p.a) + Number(p.b)) : (Number(p.a) * Number(p.b));
      addLog(`[COMPUTING] Cloud Server performs math blindly: E(${p.a}) ${p.op} E(${p.b}).`, 'bob');
      addLog(`Under the hood: (${p.a} + NoiseA) ${p.op} (${p.b} + NoiseB) = Result + CombinedNoise.`, 'bob');
      addLog(`Cloud generates E(${result}) and returns it to Alice.`, 'info');
      setPacketData(`E(${result})`);
      setSimState('returning');
      
      setTimeout(() => {
        setPacketPos(posAlice);
        setTimeout(() => {
           addLog(`[UNWRAPPING] Alice uses her private key to subtract the exact 'CombinedNoise'.`, 'alice');
           addLog(`Result + CombinedNoise - CombinedNoise = ${result}.`, 'success');
           setSimState('done');
        }, 1500);
      }, 1500);
    } else if (activeTopic === 'ecdh') {
      addLog(`Bob selects private b=${p.b}. Computes public B = ${p.b}*G and sends to Alice.`, 'bob');
      setPacketData(`B = ${p.b}G`);
      setSimState('returning');
      
      setTimeout(() => {
        setPacketPos(posAlice);
        setTimeout(() => {
          if (eveActive) addLog(`Eve intercepts B = ${p.b}G, but still cannot unwrap the shared secret.`, 'eve');
          const secretStr = `${p.a * p.b}G`;
          addLog(`[UNWRAPPING] Alice computes ${p.a} * B = ${p.a} * (${p.b}G) = ${secretStr}.`, 'alice');
          addLog(`[UNWRAPPING] Bob computes ${p.b} * A = ${p.b} * (${p.a}G) = ${secretStr}.`, 'bob');
          addLog(`The math equates perfectly. Shared secret established: ${secretStr}`, 'success');
          setSimState('done');
        }, 1500);
      }, 1500);
    } else if (activeTopic === 'ecc') {
      addLog(`[UNWRAPPING] Bob computes shared point S = PrivKey * C1 = ${p.privKey} * (${p.k}G) = ${p.privKey * p.k}G.`, 'bob');
      addLog(`Notice that k * PubKey is ALSO ${p.k} * (${p.privKey}G) = ${p.k * p.privKey}G!`, 'bob');
      addLog(`Bob subtracts S from C2: C2 - S = (${p.M} + ${p.k * p.privKey}G) - ${p.privKey * p.k}G.`, 'bob');
      addLog(`The noise terms exactly cancel out! Recovered: ${p.M}.`, 'success');
      setSimState('done');
    } else if (activeTopic === 'ggh') {
      addLog(`[UNWRAPPING] Bob multiplies by his straight, private grid V⁻¹.`, 'bob');
      addLog(`c * V⁻¹ = (${p.m} * W + ${p.r}) * V⁻¹ = (${p.m} * U * V * V⁻¹) + (${p.r} * V⁻¹)`, 'bob');
      addLog(`V * V⁻¹ cancels out! We get: ${p.m}*U + small_noise.`, 'bob');
      addLog(`Because his grid is straight, Bob easily rounds away the small_noise to get ${p.m}*U.`, 'bob');
      addLog(`Finally, Bob multiplies by U⁻¹. (${p.m}*U) * U⁻¹ cancels U. Vector m=${p.m} recovered!`, 'success');
      setSimState('done');
    } else {
      setSimState('done');
    }
  };

  // Run sim automatically for geometric topics to show descriptions
  useEffect(() => {
    const topic = TOPICS.find(t => t.id === activeTopic);
    clearLogs();
    setSimState('idle');
    if (topic.cat.includes('geometry')) {
       if (activeTopic === 'ecc') addLog('ECC: Point Addition. P + Q = R. A line connecting P and Q intersects the curve at -R, which is reflected over the x-axis to find R.', 'info');
       if (activeTopic === 'hasse') {
          const p = Number(params.hasse.p);
          const bound = Math.round(2 * Math.sqrt(p) * 100) / 100;
          addLog(`Hasse's Theorem bounds for p=${p}: Points N will be between ${p+1 - Math.floor(bound)} and ${p+1 + Math.ceil(bound)}.`, 'info');
       }
       if (activeTopic === 'cvp') addLog(`CVP: Targeting vector w = ${params.cvp.w}. Given a lattice L, finding the vector v ∈ L that minimizes ||w - v|| is NP-Hard in high dimensions.`, 'info');
       if (activeTopic === 'svp') addLog(`SVP: Finding the shortest non-zero vector in ${params.svp.basis}. The security basis of lattice crypto.`, 'info');
    }
  }, [activeTopic, params]);

  const activeData = TOPICS.find(t => t.id === activeTopic);

  // Reusable Parameter Input Component
  const ParamInput = ({ label, value, onChange, type="text", className="w-full" }) => (
    <div className="mb-2">
      <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className={`bg-gray-950 border border-gray-700 text-gray-200 text-sm px-2 py-1.5 rounded focus:outline-none focus:border-indigo-500 transition-colors font-mono ${className}`}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-500/20 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Quantum & Post-Quantum Crypto Lab</h1>
          </div>
          <button 
            onClick={() => setEveActive(!eveActive)}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${eveActive ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'}`}
          >
            <ShieldAlert className="w-4 h-4 mr-2" />
            {eveActive ? "Attacker (Eve) Active" : "Enable Attacker"}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar: Topics */}
        <div className="w-full lg:w-1/4 space-y-2">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Algorithms & Theorems</h2>
          {TOPICS.map(topic => (
            <button
              key={topic.id}
              onClick={() => { setActiveTopic(topic.id); setSimState('idle'); }}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex flex-col ${
                activeTopic === topic.id 
                  ? 'bg-indigo-900/40 border-indigo-500/50 shadow-lg shadow-indigo-500/10' 
                  : 'bg-gray-900 border-gray-800 hover:bg-gray-800 hover:border-gray-700'
              }`}
            >
              <span className={`text-sm font-bold ${activeTopic === topic.id ? 'text-indigo-300' : 'text-gray-300'}`}>{topic.name}</span>
              <div className="flex items-center mt-1 space-x-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">{topic.type}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="w-full lg:w-3/4 flex flex-col gap-6">
          
          {/* Top: 2D Interactive Visualizer */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden relative shadow-xl">
            <div className="absolute top-4 left-4 z-10 flex space-x-2">
              <span className="bg-gray-800/80 backdrop-blur border border-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full font-mono flex items-center">
                <CircleDot className="w-3 h-3 mr-2 text-indigo-400" />
                {activeData.cat === 'network' ? 'Network Data Flow View' : 'Geometric Mathematics View'}
              </span>
            </div>

            <div className="h-[300px] w-full bg-gray-950 relative overflow-hidden flex items-center justify-center">
              
              {/* --- NETWORK DATA FLOW SVG (NTRU, FHE, ECDH, GGH) --- */}
              {activeData.cat === 'network' && (
                <svg className="w-full h-full" viewBox="0 0 700 300" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="linkGradEve" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>

                  {/* Lines between nodes */}
                  <line x1={posAlice.x} y1={posAlice.y} x2={posBob.x} y2={posBob.y} stroke="url(#linkGrad)" strokeWidth="4" strokeDasharray="10,10" className="animate-[dash_20s_linear_infinite]" />
                  
                  {eveActive && (
                     <>
                      <line x1={posAlice.x} y1={posAlice.y} x2={posEve.x} y2={posEve.y} stroke="url(#linkGradEve)" strokeWidth="2" strokeDasharray="5,5" />
                      <line x1={posEve.x} y1={posEve.y} x2={posBob.x} y2={posBob.y} stroke="url(#linkGradEve)" strokeWidth="2" strokeDasharray="5,5" />
                     </>
                  )}

                  <style>{`
                    @keyframes dash { to { stroke-dashoffset: -1000; } }
                    .packet-anim { transition: all 1.5s ease-in-out; }
                  `}</style>

                  {/* Alice Node */}
                  <g transform={`translate(${posAlice.x}, ${posAlice.y})`}>
                    <circle r="40" fill="#1e1b4b" stroke="#6366f1" strokeWidth="3" />
                    <text x="0" y="-55" textAnchor="middle" fill="#a5b4fc" fontSize="14" fontWeight="bold">Alice</text>
                    <text x="0" y="5" textAnchor="middle" fill="#818cf8" fontSize="24" fontFamily="serif">A</text>
                  </g>

                  {/* Bob/Cloud Node */}
                  <g transform={`translate(${posBob.x}, ${posBob.y})`}>
                    <circle r="40" fill="#064e3b" stroke="#10b981" strokeWidth="3" />
                    <text x="0" y="-55" textAnchor="middle" fill="#6ee7b7" fontSize="14" fontWeight="bold">{activeTopic === 'fhe' ? 'Cloud Server' : 'Bob'}</text>
                    <text x="0" y="5" textAnchor="middle" fill="#34d399" fontSize="24" fontFamily="serif">{activeTopic === 'fhe' ? 'C' : 'B'}</text>
                  </g>

                  {/* Eve Node */}
                  <g transform={`translate(${posEve.x}, ${posEve.y})`} className={`transition-opacity duration-500 ${eveActive ? 'opacity-100' : 'opacity-0'}`}>
                    <circle r="35" fill="#450a0a" stroke="#ef4444" strokeWidth="3" />
                    <text x="0" y="-50" textAnchor="middle" fill="#fca5a5" fontSize="14" fontWeight="bold">Eve (Attacker)</text>
                    <text x="0" y="5" textAnchor="middle" fill="#f87171" fontSize="20" fontFamily="serif">E</text>
                  </g>

                  {/* Moving Packet */}
                  {simState !== 'idle' && simState !== 'done' && (
                    <g className="packet-anim" transform={`translate(${packetPos.x}, ${packetPos.y})`}>
                      <circle r="15" fill="#fbbf24" stroke="#d97706" strokeWidth="2" className="animate-pulse" />
                      <rect x="-40" y="-45" width="80" height="25" rx="4" fill="#1f2937" stroke="#374151" />
                      <text x="0" y="-28" textAnchor="middle" fill="#fbbf24" fontSize="12" fontFamily="monospace" fontWeight="bold">{packetData}</text>
                    </g>
                  )}
                </svg>
              )}

              {/* --- GEOMETRIC ECC SVG (ECC, Hasse) --- */}
              {activeData.cat === 'geometry-ecc' && (
                <svg className="w-full h-full" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#4b5563" />
                    </marker>
                  </defs>
                  
                  {/* Grid & Axes */}
                  <line x1="50" y1="150" x2="550" y2="150" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  <line x1="300" y1="280" x2="300" y2="20" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  <text x="540" y="140" fill="#9ca3af" fontSize="12">x</text>
                  <text x="310" y="30" fill="#9ca3af" fontSize="12">y</text>

                  {/* ECC Curve Path */}
                  <path d="M 500 10 Q 400 150 350 150 T 200 10 M 500 290 Q 400 150 350 150 T 200 290" fill="none" stroke="#6366f1" strokeWidth="3" className="opacity-80" />
                  
                  {activeTopic === 'ecc' && (
                    <g>
                       <line x1="250" y1="65" x2="480" y2="230" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5,5" />
                       <line x1="480" y1="230" x2="480" y2="70" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,4" />
                       
                       <circle cx="250" cy="65" r="6" fill="#10b981" />
                       <text x="235" y="60" fill="#10b981" fontSize="14" fontWeight="bold">P</text>
                       
                       <circle cx="390" cy="165" r="6" fill="#10b981" />
                       <text x="405" y="165" fill="#10b981" fontSize="14" fontWeight="bold">Q</text>
                       
                       <circle cx="480" cy="230" r="6" fill="#6366f1" />
                       <text x="495" y="235" fill="#6366f1" fontSize="14" fontWeight="bold">-R</text>

                       <circle cx="480" cy="70" r="8" fill="#fbbf24" />
                       <text x="495" y="70" fill="#fbbf24" fontSize="16" fontWeight="bold">R (P+Q)</text>
                    </g>
                  )}

                  {activeTopic === 'hasse' && (
                     <g transform="translate(150, 50)">
                        <rect width="300" height="200" fill="#1e1b4b" stroke="#4f46e5" strokeWidth="2" rx="10" />
                        <text x="150" y="40" textAnchor="middle" fill="#a5b4fc" fontSize="16" fontWeight="bold">Hasse's Theorem Boundary</text>
                        <text x="150" y="80" textAnchor="middle" fill="#fff" fontSize="18" fontFamily="serif">| N - (p + 1) | ≤ 2√p</text>
                        <line x1="50" y1="120" x2="250" y2="120" stroke="#4b5563" strokeWidth="4" />
                        <circle cx="150" cy="120" r="6" fill="#10b981" />
                        <text x="150" y="145" textAnchor="middle" fill="#10b981" fontSize="12">p+1={Number(params.hasse.p)+1}</text>
                        
                        <rect x="70" y="115" width="160" height="10" fill="#fbbf24" opacity="0.3" />
                        <text x="70" y="105" textAnchor="middle" fill="#fbbf24" fontSize="12">-{Math.round(2*Math.sqrt(params.hasse.p))}</text>
                        <text x="230" y="105" textAnchor="middle" fill="#fbbf24" fontSize="12">+{Math.round(2*Math.sqrt(params.hasse.p))}</text>
                     </g>
                  )}
                </svg>
              )}

              {/* --- GEOMETRIC LATTICE SVG (CVP, SVP) --- */}
              {activeData.cat === 'geometry-lattice' && (
                 <svg className="w-full h-full" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet">
                    {/* Generate Lattice Grid */}
                    {Array.from({ length: 15 }).map((_, i) => (
                      Array.from({ length: 8 }).map((_, j) => {
                        const x = 50 + i * 40 + (j % 2) * 20;
                        const y = 20 + j * 35;
                        return <circle key={`${i}-${j}`} cx={x} cy={y} r="3" fill="#4b5563" />
                      })
                    ))}
                    
                    {/* Basis Vectors */}
                    <line x1="250" y1="160" x2="290" y2="160" stroke="#6366f1" strokeWidth="3" markerEnd="url(#arrowhead)" />
                    <line x1="250" y1="160" x2="270" y2="125" stroke="#6366f1" strokeWidth="3" markerEnd="url(#arrowhead)" />
                    <circle cx="250" cy="160" r="5" fill="#fff" />
                    <text x="230" y="175" fill="#fff" fontSize="12">Origin (0,0)</text>

                    {activeTopic === 'svp' && (
                       <g>
                         <line x1="250" y1="160" x2="270" y2="125" stroke="#10b981" strokeWidth="5" markerEnd="url(#arrowhead)" />
                         <rect x="255" y="100" width="160" height="25" fill="#064e3b" rx="4" />
                         <text x="260" y="117" fill="#34d399" fontSize="12" fontWeight="bold">Shortest Non-Zero Vector</text>
                       </g>
                    )}

                    {activeTopic === 'cvp' && (
                       <g>
                         {/* Target Point W (not on lattice) */}
                         <circle cx="340" cy="115" r="6" fill="#ef4444" className="animate-pulse" />
                         <text x="350" y="110" fill="#ef4444" fontSize="14" fontWeight="bold">Target {params.cvp.w}</text>
                         
                         {/* Closest Lattice Point */}
                         <circle cx="330" cy="125" r="6" fill="#10b981" />
                         <line x1="340" y1="115" x2="330" y2="125" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3,3" />
                         <text x="340" y="145" fill="#10b981" fontSize="12" fontWeight="bold">Closest Vector (v)</text>
                       </g>
                    )}
                 </svg>
              )}
            </div>

            {/* --- NEW: Interactive Parameters (Side-by-Side) --- */}
            <div className="bg-gray-800 border-t border-gray-700 p-4">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center mb-4">
                 <Settings className="w-4 h-4 mr-2 text-indigo-400" /> Interactive Parameters
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Alice's Side */}
                  <div className="bg-indigo-950/30 border border-indigo-900/50 rounded-lg p-3">
                     <h4 className="text-indigo-400 text-sm font-bold flex items-center mb-3">
                       <User className="w-4 h-4 mr-2" /> Alice's Inputs
                     </h4>
                     
                     {activeTopic === 'ntru' && (
                       <div className="flex gap-2">
                         <ParamInput label="Message Poly m(x)" value={params.ntru.m} onChange={v => handleParamChange('ntru', 'm', v)} />
                         <ParamInput label="Blinding Poly r(x)" value={params.ntru.r} onChange={v => handleParamChange('ntru', 'r', v)} />
                       </div>
                     )}
                     {activeTopic === 'fhe' && (
                       <div className="flex gap-2">
                         <ParamInput label="Data Point A" type="number" value={params.fhe.a} onChange={v => handleParamChange('fhe', 'a', v)} />
                         <ParamInput label="Data Point B" type="number" value={params.fhe.b} onChange={v => handleParamChange('fhe', 'b', v)} />
                       </div>
                     )}
                     {activeTopic === 'ecdh' && (
                       <ParamInput label="Private Secret (a)" type="number" value={params.ecdh.a} onChange={v => handleParamChange('ecdh', 'a', v)} />
                     )}
                     {activeTopic === 'ecc' && (
                       <div className="flex gap-2">
                         <ParamInput label="Message Point (M)" value={params.ecc.M} onChange={v => handleParamChange('ecc', 'M', v)} />
                         <ParamInput label="Random (k)" type="number" value={params.ecc.k} onChange={v => handleParamChange('ecc', 'k', v)} />
                       </div>
                     )}
                     {activeTopic === 'ggh' && (
                       <div className="flex gap-2">
                         <ParamInput label="Message Vec (m)" value={params.ggh.m} onChange={v => handleParamChange('ggh', 'm', v)} />
                         <ParamInput label="Noise Vec (r)" value={params.ggh.r} onChange={v => handleParamChange('ggh', 'r', v)} />
                       </div>
                     )}
                     {activeTopic === 'hasse' && (
                        <p className="text-xs text-gray-500 italic">No specific encryption inputs for Hasse bounds.</p>
                     )}
                     {activeTopic === 'cvp' && (
                        <ParamInput label="Target Vector (w)" value={params.cvp.w} onChange={v => handleParamChange('cvp', 'w', v)} />
                     )}
                     {activeTopic === 'svp' && (
                        <ParamInput label="Lattice Basis" value={params.svp.basis} onChange={v => handleParamChange('svp', 'basis', v)} />
                     )}
                  </div>

                  {/* Bob's Side */}
                  <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-lg p-3">
                     <h4 className="text-emerald-400 text-sm font-bold flex items-center mb-3">
                       <Server className="w-4 h-4 mr-2" /> {activeTopic === 'fhe' ? 'Cloud Server Inputs' : "Bob's Inputs"}
                     </h4>
                     
                     {activeTopic === 'ntru' && (
                       <div className="flex gap-2">
                         <ParamInput label="Prime (p)" type="number" value={params.ntru.p} onChange={v => handleParamChange('ntru', 'p', v)} />
                         <ParamInput label="Modulo (q)" type="number" value={params.ntru.q} onChange={v => handleParamChange('ntru', 'q', v)} />
                       </div>
                     )}
                     {activeTopic === 'fhe' && (
                       <div className="flex gap-2 items-center">
                         <span className="text-xs text-gray-400 uppercase">Operation:</span>
                         <select 
                           className="bg-gray-950 border border-gray-700 text-gray-200 text-sm px-2 py-1.5 rounded focus:outline-none focus:border-emerald-500"
                           value={params.fhe.op}
                           onChange={e => handleParamChange('fhe', 'op', e.target.value)}
                         >
                           <option value="+">Addition (+)</option>
                           <option value="*">Multiplication (*)</option>
                         </select>
                       </div>
                     )}
                     {activeTopic === 'ecdh' && (
                       <ParamInput label="Private Secret (b)" type="number" value={params.ecdh.b} onChange={v => handleParamChange('ecdh', 'b', v)} />
                     )}
                     {activeTopic === 'ecc' && (
                       <ParamInput label="Private Key" type="number" value={params.ecc.privKey} onChange={v => handleParamChange('ecc', 'privKey', v)} />
                     )}
                     {activeTopic === 'ggh' && (
                       <p className="text-xs text-gray-500 italic mt-2">Private Good Basis V is hidden. Public Bad Basis W is fixed for simulation.</p>
                     )}
                     {activeTopic === 'hasse' && (
                       <ParamInput label="Prime Field (p)" type="number" value={params.hasse.p} onChange={v => handleParamChange('hasse', 'p', v)} />
                     )}
                     {activeTopic === 'cvp' && (
                        <p className="text-xs text-gray-500 italic">Finding closest vector requires CVP solver or Trapdoor basis.</p>
                     )}
                     {activeTopic === 'svp' && (
                        <p className="text-xs text-gray-500 italic">Finding shortest non-zero vector requires SVP solver.</p>
                     )}
                  </div>
               </div>
            </div>

          </div>

          {/* Bottom Split: Breakdown & Logs */}
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Control Panel / Breakdown */}
            <div className="w-full lg:w-1/3 bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg flex flex-col h-[500px]">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider border-b border-gray-800 pb-2 mb-4 flex items-center shrink-0">
                <Code className="w-4 h-4 mr-2 text-indigo-400" />
                Algorithm Breakdown
              </h3>
              
              <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-5">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Active Algorithm</div>
                  <div className="font-bold text-lg text-indigo-300">{activeData.name}</div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center">
                    <Shield className="w-3 h-3 mr-1" /> Core Logic
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {activeData.logic}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center">
                      <Lock className="w-3 h-3 mr-1" /> {activeData.cat === 'geometry-lattice' && activeTopic !== 'ggh' ? 'Problem Setup' : 'Encryption / Prep'}
                    </h4>
                    <ul className="space-y-2">
                      {activeData.encryptSteps.map((step, idx) => (
                        <li key={idx} className="text-sm text-gray-400 flex items-start">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500/50 mr-2 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center">
                      <Unlock className="w-3 h-3 mr-1" /> {activeData.cat === 'geometry-lattice' && activeTopic !== 'ggh' ? 'Solving / Theory' : 'Decryption / Recovery'}
                    </h4>
                    <ul className="space-y-2">
                      {activeData.decryptSteps.map((step, idx) => (
                        <li key={idx} className="text-sm text-gray-400 flex items-start">
                          <CheckCircle2 className="w-4 h-4 text-amber-500/50 mr-2 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
                
              {activeData.cat === 'network' && (
                <button 
                  onClick={runSimulation}
                  disabled={simState !== 'idle' && simState !== 'done'}
                  className="w-full mt-4 shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center"
                >
                  {simState === 'idle' || simState === 'done' ? (
                      <><RefreshCw className="w-5 h-5 mr-2" /> Run Transmission</>
                  ) : (
                      <><Activity className="w-5 h-5 mr-2 animate-spin" /> Simulating...</>
                  )}
                </button>
              )}
            </div>

            {/* Simulation Logs */}
            <div className="w-full lg:w-2/3 bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg flex flex-col h-[500px]">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider border-b border-gray-800 pb-2 mb-4 flex items-center shrink-0">
                <Activity className="w-4 h-4 mr-2 text-indigo-400" />
                Mathematical Flow Log
              </h3>
              <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600">
                     <Database className="w-8 h-8 mb-2 opacity-50" />
                     <p className="text-sm italic">System ready. Select a topic or run simulation.</p>
                  </div>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className={`p-3 rounded-lg border text-sm font-mono leading-relaxed ${
                      log.type === 'alice' ? 'bg-indigo-900/20 border-indigo-800/50 text-indigo-300' :
                      log.type === 'bob' ? 'bg-emerald-900/20 border-emerald-800/50 text-emerald-300' :
                      log.type === 'eve' ? 'bg-red-900/20 border-red-800/50 text-red-300' :
                      log.type === 'success' ? 'bg-green-900/40 border-green-700 text-green-400 font-bold' :
                      'bg-gray-800 border-gray-700 text-gray-300'
                    }`}>
                      <span className="opacity-50 text-xs mr-2 border-r border-current pr-2">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                      {log.msg}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.8); }
      `}</style>
    </div>
  );
}