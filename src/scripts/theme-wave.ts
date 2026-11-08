/** Reveal complete theme snapshots, so text and scenery share one boundary. */
export function createThemeWave(button: HTMLButtonElement, applyTheme: (dark: boolean) => void) {
  const root = document.documentElement;
  type Wave = {
    target: boolean;
    requested: boolean;
    cancelled: boolean;
    transition?: ViewTransition;
    animation?: Animation;
  };
  let active: Wave | undefined;

  function cleanUp(wave: Wave) {
    if (active !== wave) return;
    active = undefined;
    wave.animation?.cancel();
    root.classList.remove("theme-wave", "theme-wave-light");
    root.removeAttribute("data-theme-changing");
  }

  function finish() {
    const wave = active;
    if (!wave) return;
    wave.cancelled = true;
    wave.transition?.skipTransition();
    applyTheme(wave.requested);
    // Resolve the target with ordinary CSS transitions still disabled.
    getComputedStyle(document.body).color;
    cleanUp(wave);
  }

  function change(dark: boolean) {
    if (active) {
      active.requested = dark;
      const animation = active.animation;
      if (animation?.playState === "finished") {
        finish();
      } else if (animation) {
        const forward = dark === active.target;
        animation.updatePlaybackRate(forward ? 1 : -1);
        animation.play();
      }
      return;
    }
    if (root.classList.contains("dark") === dark) {
      applyTheme(dark);
      return;
    }
    const wave: Wave = { target: dark, requested: dark, cancelled: false };
    const bounds = button.getBoundingClientRect();
    const x = Math.min(innerWidth, Math.max(0, bounds.left + bounds.width / 2));
    const y = Math.min(innerHeight, Math.max(0, bounds.top + bounds.height / 2));
    // Reach the farthest corner, including the 16px feather, in either theme.
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 16;
    const origin = { "--theme-origin-x": `${x}px`, "--theme-origin-y": `${y}px` };
    active = wave;
    root.classList.add("theme-wave");
    root.classList.toggle("theme-wave-light", !dark);
    root.dataset.themeChanging = "true";
    const transition = document.startViewTransition(() => {
      if (!wave.cancelled) applyTheme(wave.target);
    });
    wave.transition = transition;
    void transition.ready.then(() => {
      if (wave.cancelled) return;
      if (wave.requested !== wave.target) {
        finish();
        return;
      }
      const animation = root.animate(
        [
          { ...origin, "--theme-radius": wave.target ? "0px" : `${radius}px` },
          { ...origin, "--theme-radius": wave.target ? `${radius}px` : "0px" },
        ],
        { duration: 900, easing: "linear", fill: "both", pseudoElement: "::view-transition-new(root)" },
      );
      wave.animation = animation;
      // Reversing the existing reveal preserves its position and speed.
      void animation.finished.then(() => {
        if (active === wave && wave.requested !== wave.target) applyTheme(wave.requested);
      }).catch(() => { /* Explicit cancellation settles through finish(). */ });
    }).catch(() => {
      if (active === wave) finish();
    });
    void transition.finished.then(() => {
      if (active !== wave) return;
      applyTheme(wave.requested);
      getComputedStyle(document.body).color;
      cleanUp(wave);
    }).catch(() => {
      if (active === wave) finish();
    });
  }

  // A captured viewport must not obscure a newly scrolled or resized document.
  window.addEventListener("resize", finish);
  window.addEventListener("scroll", finish, { passive: true });
  document.addEventListener("visibilitychange", () => { if (document.hidden) finish(); });
  // Captured document contents do not participate in native hit testing.
  // Forward clicks on the visible theme control to its existing handler so a
  // second physical click can reverse the same reveal instead of being lost.
  document.addEventListener("click", (event) => {
    if (!active || event.target !== root) return;
    const bounds = button.getBoundingClientRect();
    if (event.clientX >= bounds.left && event.clientX <= bounds.right &&
        event.clientY >= bounds.top && event.clientY <= bounds.bottom) {
      event.preventDefault();
      button.click();
    }
  });
  return { change, finish };
}
