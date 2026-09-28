/**
 * View Layer - QuizView
 * Bertanggung jawab terhadap manipulasi DOM, rendering slide, feedback instan,
 * integrasi animasi GSAP, dan kartu badge hasil akhir.
 */
class QuizView {
  constructor() {
    // Cache elemen-elemen DOM utama
    this.welcomeSection = document.getElementById('welcomeSection');
    this.quizSection = document.getElementById('quizSection');
    this.resultSection = document.getElementById('resultSection');

    // Welcome Screen
    this.inputUserName = document.getElementById('inputUserName');
    this.nameErrorMsg = document.getElementById('nameErrorMsg');
    this.btnStartQuiz = document.getElementById('btnStartQuiz');

    // Quiz Screen
    this.questionCounterBadge = document.getElementById('questionCounterBadge');
    this.quizUserTag = document.getElementById('quizUserTag');
    this.quizProgressFill = document.getElementById('quizProgressFill');
    this.questionText = document.getElementById('questionText');
    this.questionImageContainer = document.getElementById('questionImageContainer');
    this.questionImage = document.getElementById('questionImage');
    this.optionsContainer = document.getElementById('optionsContainer');
    this.btnSubmitAnswer = document.getElementById('btnSubmitAnswer');

    // Instant Feedback Container
    this.feedbackBox = document.getElementById('feedbackBox');
    this.feedbackIcon = document.getElementById('feedbackIcon');
    this.feedbackTitle = document.getElementById('feedbackTitle');
    this.feedbackText = document.getElementById('feedbackText');
    this.btnNextQuestion = document.getElementById('btnNextQuestion');

    // Results Screen
    this.statScoreVal = document.getElementById('statScoreVal');
    this.statCorrectVal = document.getElementById('statCorrectVal');
    this.statWrongVal = document.getElementById('statWrongVal');
    this.badgeCard = document.getElementById('badgeCard');
    this.badgeRibbon = document.getElementById('badgeRibbon');
    this.badgeSealIcon = document.getElementById('badgeSealIcon');
    this.badgeUserName = document.getElementById('badgeUserName');
    this.badgeTitleAward = document.getElementById('badgeTitleAward');
    this.badgeDescription = document.getElementById('badgeDescription');
    this.badgeScoreText = document.getElementById('badgeScoreText');
    this.btnRestartQuiz = document.getElementById('btnRestartQuiz');
    this.btnShareResult = document.getElementById('btnShareResult');
    this.copyToast = document.getElementById('copyToast');

    // Audio Backsound Controls
    this.bgAudio = document.getElementById('bgAudio');
    this.btnAudioToggle = document.getElementById('btnAudioToggle');
    this.audioToggleIcon = document.getElementById('audioToggleIcon');

    // Audio Sound Effects (SFX)
    this.sfxClick = document.getElementById('sfxClick');
    this.sfxCorrect = document.getElementById('sfxCorrect');
    this.sfxIncorrect = document.getElementById('sfxIncorrect');
    this.sfxResultYeay = document.getElementById('sfxResultYeay');
    this.sfxResultAcumalaka = document.getElementById('sfxResultAcumalaka');

    // Web Audio API Engine (Zero-latency audio untuk HP & Desktop)
    this.audioCtx = null;
    this.sfxBuffers = {};
    this.initWebAudio();

    this.selectedOptionKey = null;
    this.isAnswerSubmitted = false;
  }

  /**
   * Tampilkan pesan error jika nama belum diisi
   * @param {boolean} show 
   */
  showNameError(show) {
    if (this.nameErrorMsg) {
      this.nameErrorMsg.style.display = show ? 'flex' : 'none';
    }
    if (this.inputUserName) {
      if (show) {
        this.inputUserName.style.borderColor = 'var(--color-danger)';
        this.inputUserName.focus();
      } else {
        this.inputUserName.style.borderColor = '';
      }
    }
  }

  /**
   * Transisi antar section menggunakan GSAP
   * @param {HTMLElement} currentSec 
   * @param {HTMLElement} nextSec 
   * @param {Function} onComplete 
   */
  switchSection(currentSec, nextSec, onComplete) {
    if (typeof gsap !== 'undefined') {
      gsap.to(currentSec, {
        opacity: 0,
        y: -15,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          currentSec.classList.remove('active');
          nextSec.classList.add('active');
          gsap.fromTo(nextSec, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', onComplete }
          );
        }
      });
    } else {
      currentSec.classList.remove('active');
      nextSec.classList.add('active');
      if (onComplete) onComplete();
    }
  }

  /**
   * Render satu slide pertanyaan
   * @param {Object} question Data pertanyaan
   * @param {number} index Index soal saat ini (0-indexed)
   * @param {number} total Total soal
   * @param {string} userName Nama user
   */
  renderQuestionSlide(question, index, total, userName) {
    this.selectedOptionKey = null;
    this.isAnswerSubmitted = false;

    // Reset tombol submit & feedback
    this.btnSubmitAnswer.disabled = true;
    this.btnSubmitAnswer.style.display = 'inline-flex';
    this.feedbackBox.style.display = 'none';
    this.feedbackBox.className = 'feedback-box';

    // Update Counter & Progress
    const currentNum = index + 1;
    this.questionCounterBadge.innerHTML = `
      <span class="material-symbols-outlined" style="font-size:1rem;">quiz</span>
      Pertanyaan ${currentNum} / ${total}
    `;
    this.quizUserTag.textContent = userName;

    const progressPercent = (currentNum / total) * 100;
    this.quizProgressFill.style.width = `${progressPercent}%`;

    // Render Teks Pertanyaan
    this.questionText.textContent = question.question;

    // Render Gambar Ilustrasi (jika ada)
    if (question.image) {
      this.questionImage.src = question.image;
      this.questionImage.alt = `Ilustrasi Soal ${currentNum}`;
      this.questionImageContainer.style.display = 'flex';
    } else {
      this.questionImageContainer.style.display = 'none';
      this.questionImage.removeAttribute('src');
    }

    // Render Opsi Jawaban
    this.optionsContainer.innerHTML = '';
    question.options.forEach(opt => {
      const optionEl = document.createElement('div');
      optionEl.className = 'option-card';
      optionEl.setAttribute('data-key', opt.key);

      optionEl.innerHTML = `
        <div class="option-badge-key">${opt.key}</div>
        <p class="option-text">${opt.text}</p>
        <span class="material-symbols-outlined option-status-icon">check_circle</span>
      `;

      this.optionsContainer.appendChild(optionEl);
    });

    // GSAP animasi masuk kartu soal
    if (typeof gsap !== 'undefined') {
      gsap.fromTo('#questionBox', 
        { opacity: 0, x: 25 },
        { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }
      );
      gsap.fromTo('.option-card',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.25, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }

  /**
   * Menandai opsi yang dipilih oleh pengguna
   * @param {string} optionKey 
   */
  highlightSelectedOption(optionKey) {
    if (this.isAnswerSubmitted) return;

    this.selectedOptionKey = optionKey;
    const cards = this.optionsContainer.querySelectorAll('.option-card');
    cards.forEach(card => {
      if (card.getAttribute('data-key') === optionKey) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    // Aktifkan tombol submit
    this.btnSubmitAnswer.disabled = false;
  }

  /**
   * Tampilkan feedback instan detik itu juga setelah menekan tombol submit
   * @param {Object} evalResult 
   */
  showInstantFeedback(evalResult) {
    this.isAnswerSubmitted = true;
    this.btnSubmitAnswer.style.display = 'none';

    const cards = this.optionsContainer.querySelectorAll('.option-card');
    cards.forEach(card => {
      card.classList.add('disabled');
      const key = card.getAttribute('data-key');
      const icon = card.querySelector('.option-status-icon');

      if (key === evalResult.correctKey) {
        card.classList.add('is-correct');
        if (icon) icon.textContent = 'check_circle';
      } else if (key === evalResult.selectedKey && !evalResult.isCorrect) {
        card.classList.add('is-wrong');
        if (icon) icon.textContent = 'cancel';
      }
    });

    // Konfigurasi Kotak Feedback & Sound Effects
    if (evalResult.isCorrect) {
      this.playCorrectSound();
      this.feedbackBox.className = 'feedback-box feedback-correct';
      this.feedbackIcon.textContent = 'check_circle';
      this.feedbackTitle.textContent = 'Jawaban Anda Tepat!';
      this.feedbackText.textContent = evalResult.explanation || 'Anda menjawab dengan benar.';
    } else {
      this.playIncorrectSound();
      this.feedbackBox.className = 'feedback-box feedback-wrong';
      this.feedbackIcon.textContent = 'cancel';
      this.feedbackTitle.textContent = 'Jawaban Anda Salah!';
      this.feedbackText.innerHTML = `
        <strong>Jawaban Benar:</strong> Opsi ${evalResult.correctKey} - ${evalResult.correctText}<br>
        <span class="text-muted mt-1 d-inline-block">${evalResult.explanation}</span>
      `;
    }

    this.feedbackBox.style.display = 'block';

    // Animasi Feedback dengan GSAP
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(this.feedbackBox, 
        { opacity: 0, y: 15, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(1.5)' }
      );
    }
  }

  /**
   * Render layar hasil akhir dan badge kartu
   * @param {Object} stats Statistik kuis (score, correct, wrong, total)
   * @param {Object} gradeInfo Informasi predikat & badge
   * @param {string} userName Nama peserta
   */
  renderResults(stats, gradeInfo, userName) {
    this.statScoreVal.textContent = `${stats.score}`;
    this.statCorrectVal.textContent = `${stats.correct} / ${stats.total}`;
    this.statWrongVal.textContent = `${stats.wrong}`;

    // Styling Badge Card
    this.badgeCard.className = `badge-card ${gradeInfo.themeClass}`;
    this.badgeRibbon.textContent = gradeInfo.ribbonText;
    this.badgeSealIcon.textContent = gradeInfo.icon;
    this.badgeUserName.textContent = userName;
    this.badgeTitleAward.textContent = gradeInfo.badgeTitle;
    this.badgeDescription.textContent = gradeInfo.message;
    this.badgeScoreText.innerHTML = `
      <span class="material-symbols-outlined" style="font-size:1.15rem; color:var(--color-primary);">analytics</span>
      Skor Akhir: <strong>${stats.score} / 100</strong> (${stats.correct} Benar dari ${stats.total} Soal)
    `;

    // Mainkan sound effect hasil sesuai tier:
    // 'sejati' (tinggi) & 'medium' -> yeay.mp3
    // 'suki' -> acumalaka.mp3
    this.playResultSound(gradeInfo.tier);

    // Efek Animasi GSAP Reveal
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(this.badgeCard,
        { scale: 0.9, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.4)', delay: 0.1 }
      );
      gsap.fromTo('.stat-metric-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
      );
    }
  }

  /**
   * Tampilkan toast popup ringan saat menyalin teks
   * @param {string} msg 
   */
  showToast(msg) {
    if (!this.copyToast) return;
    this.copyToast.querySelector('.toast-text').textContent = msg;
    this.copyToast.classList.add('show');
    setTimeout(() => {
      this.copyToast.classList.remove('show');
    }, 2500);
  }

  /**
   * Menyalakan musik backsound kuis
   */
  playBacksound() {
    if (this.bgAudio) {
      this.bgAudio.volume = 0.55;
      const playPromise = this.bgAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.updateAudioUI(true);
          })
          .catch((err) => {
            console.warn('Autoplay audio tercegah browser policy:', err);
            this.updateAudioUI(false);
          });
      }
    }
  }

  /**
   * Toggle pause/play musik backsound
   */
  toggleBacksound() {
    if (!this.bgAudio) return;

    if (this.bgAudio.paused) {
      this.bgAudio.play().then(() => {
        this.updateAudioUI(true);
      }).catch(err => console.warn('Error memutar audio:', err));
    } else {
      this.bgAudio.pause();
      this.updateAudioUI(false);
    }
  }

  /**
   * Sinkronisasi icon dan tampilan tombol toggle audio
   * @param {boolean} isPlaying 
   */
  updateAudioUI(isPlaying) {
    if (!this.btnAudioToggle || !this.audioToggleIcon) return;

    if (isPlaying) {
      this.audioToggleIcon.textContent = 'volume_up';
      this.btnAudioToggle.classList.remove('muted');
      this.btnAudioToggle.setAttribute('title', 'Matikan Musik Backsound');
    } else {
      this.audioToggleIcon.textContent = 'volume_off';
      this.btnAudioToggle.classList.add('muted');
      this.btnAudioToggle.setAttribute('title', 'Nyalakan Musik Backsound');
    }
  }

  /**
   * Inisialisasi Web Audio API & pre-decode audio buffer di RAM
   */
  initWebAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
        this.loadSfxBuffer('click', 'backsound/mouse-click.mp3');
        this.loadSfxBuffer('correct', 'backsound/correct.mp3');
        this.loadSfxBuffer('incorrect', 'backsound/incorrect.mp3');
        this.loadSfxBuffer('yeay', 'backsound/yeay.mp3');
        this.loadSfxBuffer('acumalaka', 'backsound/acumalaka.mp3');
      }
    } catch (e) {
      console.warn('Web Audio API tidak aktif, beralih ke HTML5 Audio:', e);
    }
  }

  /**
   * Mengambil file audio dan mendecode langsung menjadi AudioBuffer di memori
   * @param {string} name 
   * @param {string} url 
   */
  async loadSfxBuffer(name, url) {
    if (!this.audioCtx) return;
    try {
      const res = await fetch(url);
      const arrayBuf = await res.arrayBuffer();
      this.audioCtx.decodeAudioData(arrayBuf, (decoded) => {
        this.sfxBuffers[name] = decoded;
      }, (err) => {
        console.warn(`Gagal decode audio ${name}:`, err);
      });
    } catch (err) {
      console.warn(`Gagal fetch buffer ${name}:`, err);
    }
  }

  /**
   * Memainkan AudioBuffer secara langsung (0ms latency, zero delay di mobile)
   * @param {string} name 
   * @param {number} volume 
   * @returns {boolean} true jika sukses via Web Audio API
   */
  playBuffer(name, volume = 1.0) {
    if (this.audioCtx) {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const buffer = this.sfxBuffers[name];
      if (buffer) {
        try {
          const source = this.audioCtx.createBufferSource();
          const gain = this.audioCtx.createGain();
          gain.gain.value = volume;
          source.buffer = buffer;
          source.connect(gain);
          gain.connect(this.audioCtx.destination);
          source.start(0);
          return true;
        } catch (e) {
          console.warn('Error playback buffer:', e);
        }
      }
    }
    return false;
  }

  /**
   * Memainkan SFX klik tombol / interaksi UI (Zero Delay di HP)
   */
  playClickSound() {
    // 1. Coba via Web Audio API (instan 0ms)
    if (this.playBuffer('click', 0.7)) return;

    // 2. Fallback HTML5 audio
    if (this.sfxClick) {
      this.sfxClick.currentTime = 0;
      this.sfxClick.volume = 0.65;
      this.sfxClick.play().catch(() => {});
    }
  }

  /**
   * Memainkan SFX ketika jawaban benar (Zero Delay di HP)
   */
  playCorrectSound() {
    if (this.playBuffer('correct', 0.85)) return;

    if (this.sfxCorrect) {
      this.sfxCorrect.currentTime = 0;
      this.sfxCorrect.volume = 0.8;
      this.sfxCorrect.play().catch(() => {});
    }
  }

  /**
   * Memainkan SFX ketika jawaban salah (Zero Delay di HP)
   */
  playIncorrectSound() {
    if (this.playBuffer('incorrect', 0.85)) return;

    if (this.sfxIncorrect) {
      this.sfxIncorrect.currentTime = 0;
      this.sfxIncorrect.volume = 0.8;
      this.sfxIncorrect.play().catch(() => {});
    }
  }

  /**
   * Memainkan SFX hasil kuis:
   * - yeay.mp3 untuk tier medium dan tinggi (sejati)
   * - acumalaka.mp3 untuk tier suki liar
   * @param {string} tier ('sejati', 'medium', 'suki')
   */
  playResultSound(tier) {
    this.stopResultSounds();

    if (tier === 'suki') {
      if (this.playBuffer('acumalaka', 0.95)) return;
      if (this.sfxResultAcumalaka) {
        this.sfxResultAcumalaka.currentTime = 0;
        this.sfxResultAcumalaka.volume = 0.9;
        this.sfxResultAcumalaka.play().catch(err => console.warn('Gagal memutar audio acumalaka:', err));
      }
    } else {
      // tier 'medium' dan 'sejati' (tinggi)
      if (this.playBuffer('yeay', 0.95)) return;
      if (this.sfxResultYeay) {
        this.sfxResultYeay.currentTime = 0;
        this.sfxResultYeay.volume = 0.9;
        this.sfxResultYeay.play().catch(err => console.warn('Gagal memutar audio yeay:', err));
      }
    }
  }

  /**
   * Menghentikan audio hasil jika kuis di-reset/diulang
   */
  stopResultSounds() {
    if (this.sfxResultYeay) {
      this.sfxResultYeay.pause();
      this.sfxResultYeay.currentTime = 0;
    }
    if (this.sfxResultAcumalaka) {
      this.sfxResultAcumalaka.pause();
      this.sfxResultAcumalaka.currentTime = 0;
    }
  }
}
