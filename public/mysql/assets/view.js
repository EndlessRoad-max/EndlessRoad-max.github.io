// 给 pre[data-copy] 挂一个复制按钮。file:// 下 navigator.clipboard 可能不可用，走 execCommand 兜底。
document.querySelectorAll('pre[data-copy]').forEach((pre) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'command';
  pre.before(wrapper);
  wrapper.append(pre);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'copy';
  button.textContent = '复制';
  wrapper.append(button);

  button.addEventListener('click', async () => {
    const text = pre.querySelector('code')?.textContent ?? pre.textContent;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
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
    } catch {
      button.textContent = '请手动选中';
    }
    setTimeout(() => { button.textContent = '复制'; }, 2000);
  });
});
