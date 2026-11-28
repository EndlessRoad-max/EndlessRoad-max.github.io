// 本地 HTML 也可用：复制按钮带回退；图片原始链接在关闭脚本时仍可打开。
document.querySelectorAll('pre[data-copy]').forEach((pre) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'command';
  pre.before(wrapper);
  wrapper.append(pre);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'copy';
  button.textContent = '复制命令';
  wrapper.append(button);
  button.addEventListener('click', async () => {
    const text = pre.querySelector('code')?.textContent ?? pre.textContent;
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const area = document.createElement('textarea');
        area.value = text;
        area.style.position = 'fixed';
        area.style.left = '-9999px';
        document.body.append(area);
        area.select();
        const copied = document.execCommand('copy');
        area.remove();
        button.focus();
        if (!copied) throw new Error('copy failed');
      }
      button.textContent = '已复制';
    } catch { button.textContent = '请选中代码复制'; }
    setTimeout(() => { button.textContent = '复制命令'; }, 2000);
  });
});

const viewer = document.createElement('dialog');
viewer.className = 'image-viewer';
viewer.setAttribute('aria-label', '原理图大图');
viewer.innerHTML = '<div class="viewer-bar"><span>原理图 · 窄屏可横向滚动，Esc 关闭</span><button type="button">关闭大图</button></div><div class="viewer-scroll"><img alt=""></div>';
document.body.append(viewer);
viewer.querySelector('button').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', (event) => { if (event.target === viewer) viewer.close(); });
document.querySelectorAll('a[data-diagram]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (typeof viewer.showModal !== 'function' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const img = viewer.querySelector('img');
    img.src = link.href;
    img.alt = link.querySelector('img').alt;
    viewer.showModal();
  });
});
