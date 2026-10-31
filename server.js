const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ─── QUESTIONS ────────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 1,
    question: "Rasmiy Telegram kanaldan @admin akkaunti sizga yozdi: \"Sizning kanalingizga kiberhujum bo'lmoqda, zudlik bilan botimizga kirib parolingizni tasdiqlang.\" Nima qilasiz?",
    options: [
      "Kanalimni qutqarish uchun botga kirib parolni kiritaman",
      "Bu fishing (aldov). Telegram rasmiy ma'muriyati hech qachon shaxsiy chatingizga yozib parol so'ramaydi",
      "Akkauntimni xavfsiz qilish uchun parolni do'stimga yuborib turaman",
      "Telefonni o'chirib-yoqib, Telegramni o'chirib tashlayman"
    ],
    correct: 1,
    explanation: "Telegram yoki boshqa hech qanday rasmiy xizmat hech qachon parol so'ramaydi. Bu klassik phishing hujumi!"
  },
  {
    id: 2,
    question: "Siz Play Market'dan 10 million martadan ortiq yuklab olingan mashhur bepul kalkulyator ilovasini o'rnatdingiz. Ilova \"Kontaktlar va SMS'larga ruxsat bering\" deb so'radi. Nima qilasiz?",
    options: [
      "Ruxsat beraman, chunki u Play Market'da bor va ko'p yuklangan",
      "Ruxsatni rad etaman. Kalkulyator uchun SMS va kontaktlarga kirish mantiqsiz va xavfli",
      "Faqat SMS'ga ruxsat beraman, kontaktlarga emas",
      "Ruxsat berib, keyin kalkulyatorni o'chirib tashlayman"
    ],
    correct: 1,
    explanation: "Ilova so'ragan ruxsatlar uning vazifasiga mos kelishi kerak. Kalkulyatorga SMS/Kontakt ruxsati kerak emas — bu Spyware belgisi!"
  },
  {
    id: 3,
    question: "Kafe yoki aeroportdagi ochiq (parolsiz) Wi-Fi tarmog'iga ulandingiz. Quyidagilardan qaysi harakat eng xavfsiz hisoblanadi?",
    options: [
      "Bank ilovasiga kirib balansni tekshirish",
      "Shaxsiy parollarni o'zgartirish",
      "Ishonchli VPN xizmatini yoqib foydalanish yoki muhim amallarni bajarmaslik",
      "Telefonni samolyot rejimiga o'tkazish"
    ],
    correct: 2,
    explanation: "Ochiq Wi-Fi'da trafikingizni hamma ko'ra oladi (MITM hujumi). VPN trafikni shifrlaydi. Muhim amalllarni bajarmaslik ham to'g'ri yondashuv."
  },
  {
    id: 4,
    question: "Do'stingizning Telegram profilidan kutilmaganda xabar keldi: \"O'rtoq, shoshilinch kartamga 200 ming so'm tashlab tur, kechqurun qaytaraman\". Birinchi navbatda nima qilasiz?",
    options: [
      "Do'stim bo'lgani uchun darhol pul o'tkazib beraman",
      "Do'stimga telefon qilib (yoki boshqa aloqa yo'li bilan) bu xabarni o'zi yozganiga aniqlik kiritaman",
      "Telegramda kartasining rasmini so'rayman",
      "Puli yo'qligi uchun uni bloklab qo'yaman"
    ],
    correct: 1,
    explanation: "Do'stingizning akkaunti buzilgan bo'lishi mumkin! Har doim boshqa kanal (telefon, yuzma-yuz) orqali tasdiqlag. Bu Social Engineering hujumi!"
  },
  {
    id: 5,
    question: "Sizga noma'lum raqamdan SMS keldi: \"Sizning pochtangizga posilka keldi, uni olish uchun havola orqali 5.000 so'm yetkazib berish haqini to'lang\". Eng to'g'ri harakat qaysi?",
    options: [
      "5.000 so'm oz pul bo'lgani uchun havolaga kirib to'layman",
      "Havolaga kirib faqat karta raqamimni kiritaman",
      "SMS'dagi havolaga kirmayman. Karta ma'lumotlarini o'g'irlash uchun yaratilgan soxta sayt (Smishing)",
      "SMS'ga \"Qanaqa posilka?\" deb javob yozaman"
    ],
    correct: 2,
    explanation: "Bu Smishing (SMS + Phishing) hujumi. Oz summa bilan aldab, karta ma'lumotlarini o'g'irlashadi. Hech qachon SMS havolasiga karta ma'lumotlarini kiritmang!"
  },
  {
    id: 6,
    question: "Telefoningizga 2FA (Ikki bosqichli autentifikatsiya) yoqilgan. Hacker parolingizni bilib oldi. U sizning akkauntingizga kira oladimi?",
    options: [
      "Ha, chunki parol asosiy kalit hisoblanadi",
      "Yo'q, chunki ikkinchi bosqichdagi Maxsus Kod yoki Tasdiqlashsiz kira olmaydi",
      "Faqat Wi-Fi yoqilgan bo'lsa kiradi",
      "Ha, agar u tajribali xaker bo'lsa"
    ],
    correct: 1,
    explanation: "2FA ikkinchi qatlam himoya beradi. Parol o'g'irlansa ham, telefondagi kod yoki autentifikator ilovasisiz kirish imkonsiz. Har doim 2FA yoqing!"
  },
  {
    id: 7,
    question: "Dasturchi do'stingiz sizga USB-Fleshka berdi va \"Ichida zo'r kino bor, ko'r\" dedi. Kompyuterga ulashdan oldin nima qilish kerak?",
    options: [
      "Darhol ulab, kinoni ochib ko'raman",
      "Fleshkani telefonga ulashga harakat qilaman",
      "Kompyuterga ulagach, avtotakrorlash (autorun) o'chiqligiga ishonch hosil qilib, antivirus bilan skaner qilaman",
      "Fleshkani format qilib keyin kinoni ko'raman"
    ],
    correct: 2,
    explanation: "USB qurilmalar zararli dastur (BadUSB, Rubber Ducky) tarqatish uchun ishlatilishi mumkin. Avval autorun o'chiring va antivirus bilan tekshiring!"
  },
  {
    id: 8,
    question: "Kiberxavfsizlikda \"Social Engineering\" (Ijtimoiy muhandislik) deganda nimani tushunasiz?",
    options: [
      "Ijtimoiy tarmoqlar uchun dasturlar yozishni",
      "Tizimni emas, inson psixologiyasini (ishonch, qo'rquv, qiziqish) manipulyatsiya qilib ma'lumotni o'g'irlashni",
      "Kompyuter apparat qismlarini ta'mirlashni",
      "Jamiyatdagi muammolarni IT orqali hal qilishni"
    ],
    correct: 1,
    explanation: "Social Engineering texnik zaifliklardan emas, insonning psixologik zaifliklaridan foydalanadi. Eng xavfli va keng tarqalgan hujum usuli!"
  },
  {
    id: 9,
    question: "Saytga kirganingizda brauzer manzillar satrida \"http://\" (yonida qulf rasmi yo'q) deb yozilgan. Bu nimani anglatadi?",
    options: [
      "Sayt juda tez ishlaydi",
      "Sayt 100% virusli va buzg'unchi",
      "Sayt bilan aloqa shifrlanmagan (HTTPS emas), bu yerga karta yoki parollarni kiritish xavfli",
      "Sayt faqat telefonlar uchun mo'ljallangan"
    ],
    correct: 2,
    explanation: "HTTP'da ma'lumotlar ochiq uzatiladi — o'rtadagi hujumchi (MITM) hamma narsani o'qiy oladi. Faqat HTTPS (qulf belgisi bor) saytlarga maxfiy ma'lumot kiriting!"
  },
  {
    id: 10,
    question: "\"HTTPS://TELEGRAM-BONUS-UZ.RU\" havolasi haqida nima deya olasiz?",
    options: [
      "Rasmiy HTTPS protokoli bo'lgani uchun bu 100% xavfsiz sayt",
      "Bu Telegram'ning rasmiy O'zbekistondagi filiali sayti",
      "HTTPS protokoli mavjud bo'lsa ham, domen nomi (telegram-bonus-uz.ru) soxta va phishing uchun yaratilgan",
      "Sayt nomida \"uz\" bo'lgani uchun xavfsiz"
    ],
    correct: 2,
    explanation: "HTTPS faqat aloqa shifrlanishini kafolatlaydiga, saytning haqiqiyligini emas! Domen (.ru) va nom (telegram-bonus-uz) soxta ekanini ko'rsatadi."
  }
];

const QUESTION_TIME = 20; // seconds per question

// ─── GAME STATE ───────────────────────────────────────────────────────────────
let gameState = {
  status: 'waiting', // waiting | playing | question | leaderboard | finished
  players: {},       // socketId -> { name, score, streak, answeredThis }
  currentQuestion: -1,
  questionStartTime: null,
  timer: null,
  adminSocket: null,
};

function getLeaderboard(limit = 5) {
  return Object.values(gameState.players)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((p, i) => ({ rank: i + 1, name: p.name, score: p.score }));
}

function resetGame() {
  if (gameState.timer) clearTimeout(gameState.timer);
  Object.values(gameState.players).forEach(p => {
    p.score = 0;
    p.streak = 0;
    p.answeredThis = false;
  });
  gameState.status = 'waiting';
  gameState.currentQuestion = -1;
  gameState.questionStartTime = null;
  gameState.timer = null;
}

function broadcastPlayerCount() {
  const count = Object.keys(gameState.players).length;
  io.emit('playerCount', { count });
}

function startQuestion(index) {
  if (index >= QUESTIONS.length) {
    // Game over
    gameState.status = 'finished';
    const leaderboard = getLeaderboard(10);
    const winner = leaderboard[0] || null;
    io.emit('gameFinished', { leaderboard, winner });
    return;
  }

  gameState.currentQuestion = index;
  gameState.status = 'question';
  gameState.questionStartTime = Date.now();

  // Reset answered flags
  Object.values(gameState.players).forEach(p => {
    p.answeredThis = false;
    p.answerTime = null;
  });

  const q = QUESTIONS[index];
  const payload = {
    questionIndex: index,
    total: QUESTIONS.length,
    question: q.question,
    options: q.options,
    timeLimit: QUESTION_TIME,
  };

  io.emit('newQuestion', payload);

  // Auto-advance after time limit
  gameState.timer = setTimeout(() => {
    revealAnswer(index);
  }, QUESTION_TIME * 1000 + 500);
}

function revealAnswer(index) {
  if (gameState.timer) clearTimeout(gameState.timer);
  gameState.status = 'leaderboard';

  const q = QUESTIONS[index];
  const leaderboard = getLeaderboard(5);

  io.emit('questionEnd', {
    correctIndex: q.correct,
    explanation: q.explanation,
    leaderboard,
  });

  // Auto next question after 5s
  gameState.timer = setTimeout(() => {
    startQuestion(index + 1);
  }, 6000);
}

// ─── SOCKET EVENTS ────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[+] Connected: ${socket.id}`);

  // Admin panel joining
  socket.on('adminJoin', () => {
    gameState.adminSocket = socket.id;
    socket.join('admin');
    socket.emit('adminState', {
      status: gameState.status,
      playerCount: Object.keys(gameState.players).length,
      currentQuestion: gameState.currentQuestion,
      leaderboard: getLeaderboard(10),
    });
    console.log(`[ADMIN] Admin joined: ${socket.id}`);
  });

  // Player joining
  socket.on('playerJoin', ({ name }) => {
    if (!name || name.trim().length < 2) {
      socket.emit('joinError', { message: "Ism kamida 2 ta harf bo'lishi kerak" });
      return;
    }

    // Check duplicate name
    const exists = Object.values(gameState.players).find(
      p => p.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (exists) {
      socket.emit('joinError', { message: "Bu ism allaqachon band. Boshqa ism tanlang." });
      return;
    }

    gameState.players[socket.id] = {
      id: socket.id,
      name: name.trim(),
      score: 0,
      streak: 0,
      answeredThis: false,
      answerTime: null,
    };

    socket.join('players');
    socket.emit('joinSuccess', {
      name: name.trim(),
      status: gameState.status,
    });

    broadcastPlayerCount();
    io.to('admin').emit('playerJoined', {
      name: name.trim(),
      count: Object.keys(gameState.players).length,
    });

    console.log(`[PLAYER] ${name} joined. Total: ${Object.keys(gameState.players).length}`);

    // If game already in progress, send current question
    if (gameState.status === 'question' && gameState.currentQuestion >= 0) {
      const q = QUESTIONS[gameState.currentQuestion];
      const elapsed = Math.floor((Date.now() - gameState.questionStartTime) / 1000);
      const remaining = Math.max(0, QUESTION_TIME - elapsed);
      socket.emit('newQuestion', {
        questionIndex: gameState.currentQuestion,
        total: QUESTIONS.length,
        question: q.question,
        options: q.options,
        timeLimit: remaining,
        lateJoin: true,
      });
    }
  });

  // Player answer
  socket.on('submitAnswer', ({ questionIndex, answerIndex }) => {
    const player = gameState.players[socket.id];
    if (!player) return;
    if (gameState.status !== 'question') return;
    if (gameState.currentQuestion !== questionIndex) return;
    if (player.answeredThis) return; // already answered

    player.answeredThis = true;
    player.answerTime = Date.now();

    const q = QUESTIONS[questionIndex];
    const isCorrect = answerIndex === q.correct;
    const elapsed = (Date.now() - gameState.questionStartTime) / 1000;
    const timeBonus = Math.max(0, Math.round((QUESTION_TIME - elapsed) * 50));

    let points = 0;
    if (isCorrect) {
      points = 1000 + timeBonus;
      player.streak += 1;
      if (player.streak >= 3) points = Math.round(points * 1.2); // streak bonus
      player.score += points;
    } else {
      player.streak = 0;
    }

    socket.emit('answerResult', {
      correct: isCorrect,
      correctIndex: q.correct,
      points,
      totalScore: player.score,
      streak: player.streak,
    });

    // Update admin leaderboard in real-time
    io.to('admin').emit('liveLeaderboard', getLeaderboard(5));

    // Check if all answered
    const total = Object.keys(gameState.players).length;
    const answered = Object.values(gameState.players).filter(p => p.answeredThis).length;
    if (answered >= total && total > 0) {
      if (gameState.timer) clearTimeout(gameState.timer);
      setTimeout(() => revealAnswer(questionIndex), 1000);
    }
  });

  // Admin: start game
  socket.on('startGame', () => {
    if (socket.id !== gameState.adminSocket) return;
    if (gameState.status !== 'waiting') return;
    const count = Object.keys(gameState.players).length;
    if (count === 0) {
      socket.emit('adminError', { message: "Hech kim ulanmagan!" });
      return;
    }
    gameState.status = 'playing';
    io.emit('gameStarted', { playerCount: count });
    setTimeout(() => startQuestion(0), 3000);
    console.log(`[GAME] Started with ${count} players`);
  });

  // Admin: reset game
  socket.on('resetGame', () => {
    if (socket.id !== gameState.adminSocket) return;
    resetGame();
    io.emit('gameReset');
    io.to('admin').emit('adminState', {
      status: 'waiting',
      playerCount: Object.keys(gameState.players).length,
      currentQuestion: -1,
      leaderboard: [],
    });
    console.log(`[GAME] Reset`);
  });

  // Admin: force next question
  socket.on('forceNext', () => {
    if (socket.id !== gameState.adminSocket) return;
    if (gameState.timer) clearTimeout(gameState.timer);
    if (gameState.status === 'question') {
      revealAnswer(gameState.currentQuestion);
    } else if (gameState.status === 'leaderboard') {
      startQuestion(gameState.currentQuestion + 1);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    const player = gameState.players[socket.id];
    if (player) {
      console.log(`[-] Player left: ${player.name}`);
      delete gameState.players[socket.id];
      broadcastPlayerCount();
      io.to('admin').emit('playerLeft', {
        name: player.name,
        count: Object.keys(gameState.players).length,
      });
    } else {
      console.log(`[-] Unknown disconnected: ${socket.id}`);
    }
    if (gameState.adminSocket === socket.id) {
      gameState.adminSocket = null;
      console.log('[ADMIN] Admin disconnected');
    }
  });
});

// ─── REST ─────────────────────────────────────────────────────────────────────
app.get('/', (_, res) => res.send('🛡️ Cyber Security Quiz Server is Live!'));
app.get('/api/health', (_, res) => res.json({ status: 'ok', players: Object.keys(gameState.players).length }));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 Cyber Quiz Server running on http://localhost:${PORT}`);
  console.log(`   Admin Panel: http://localhost:5173/admin`);
  console.log(`   Player Join: http://localhost:5173/join\n`);
});
