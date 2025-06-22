export const AudioPlayer = {
    sounds: {},

    init() {
        const soundFiles = {
            'click': 'assets/sounds/click.mp3',
            'wrong-click': 'assets/sounds/wrong-click.mp3',
            'music': 'assets/sounds/music.mp3',
            'player-defeated': 'assets/sounds/player-defeated.mp3',
            'up': 'assets/sounds/up.mp3',
            'down': 'assets/sounds/down.mp3',
            'main-menu': 'assets/sounds/main-menu.mp3',
            'battle': 'assets/sounds/battle.mp3',
        };

        for (const [key, url] of Object.entries(soundFiles)) {
            const audio = new Audio(url);
            audio.load();
            this.sounds[key] = audio;
        }
    },

    playSound(key) {
        const audio = this.sounds[key];
        if (audio && !AudioPlayer.muted) {
            audio.currentTime = 0;
            audio.play().catch(e => console.warn("Ошибка воспроизведения:", e));
        }
    },

    playBackgroundMusic(loop = true) {
        const music = this.sounds.music;
        if (music && !AudioPlayer.muted) {
            music.loop = loop;
            music.currentTime = 0;
            music.play().catch(e => console.warn("Ошибка фоновой музыки:", e));
        }
    },

    stopBackgroundMusic() {
        const music = this.sounds.music;
        if (music) {
            music.pause();
            music.currentTime = 0;
        }
    },

    toggleMute() {
        AudioPlayer.muted = !AudioPlayer.muted;

        for (const key in this.sounds) {
            this.sounds[key].volume = AudioPlayer.muted ? 0 : 1;
        }

        return AudioPlayer.muted;
    },

    muted: false
};

AudioPlayer.init();