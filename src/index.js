const createScroll = ({ container, elements }) => {
  const wrapper = document.createElement('div');
  const containerWidth = container.clientWidth;
  const borderTop = container.offsetTop;
  const debounceTime = 100;
  let containerHeight = container.clientHeight;
  let renderElements = elements;
  let cache = [];

  // ToDo: calculate minimum render amount
  let renderCount = 10;
  let bufferCount = 5;
  let currentTopIndex = 0;
  let currentBottomIndex = currentTopIndex + renderCount;
  let currentIndex = 0;

  // todo: get scrollbar
  const scrollBarWidth = 17;

  container.style.overflowY = 'scroll';

  wrapper.style.width = `${containerWidth - scrollBarWidth}px`;
  wrapper.style.height = `${container.clientHeight}px`;
  wrapper.style.overflowY = 'hidden';
  wrapper.style.position = 'relative';

  container.appendChild(wrapper);
  
  const preRender = () => {
    const content = Array.from(renderElements)
      .reduce((cal, e) => {
        const attributes = Array.from(e.attributes).map(attr => `${attr.name}="${attr.value}"`).join(' ');
        return `${cal}<div ${attributes}>${e.innerHTML}</div>`;
      }, '');
    wrapper.innerHTML = content;
    window.requestAnimationFrame(() => {
      containerHeight = wrapper.style.height = wrapper.scrollHeight + scrollBarWidth + 'px';
      cache = Array.from(wrapper.querySelectorAll('div')).map(div => {
        return {
          height: div.clientHeight,
          top: div.offsetTop
        };
      })
      while (wrapper.firstChild) {
        wrapper.removeChild(wrapper.firstChild);
      }
      render(currentIndex);
    });
  }
  
  const render = (index) => {
    while (wrapper.firstChild) {
      wrapper.removeChild(wrapper.firstChild);
    }
    const frag = document.createDocumentFragment();
    for (let i = index; i < index + renderCount & i < renderElements.length; i ++ ){
      if (!cache[i].dom) {
        const div = document.createElement('div');
        Array.from(renderElements[i].attributes).forEach((attr) => {
          div.setAttribute(attr.name, attr.value);
        });
        div.style.position = 'absolute';
        div.style.transform = `translate(0px, ${cache[i].top}px)`;
        div.innerHTML = renderElements[i].innerHTML;
        cache[i].dom = div;
      }
      frag.appendChild(cache[i].dom);
    }
    wrapper.appendChild(frag);
  }
  
  const debounce = (fn, t) => {
    let isLocked = false;
    
    return function (...args) {
      if (!isLocked) {
        isLocked = true;
        setTimeout(() => {
          fn(...args);
          isLocked = false;
        }, t);
      };
    }
  }
  const scrollEvent = () => {
    const dy = container.scrollTop;
    const index = cache.findIndex(e => dy >= e.top && dy < e.top + e.height);
    if (index < 0) {
      return;
    }
    if ((index + bufferCount >= currentBottomIndex || index - bufferCount <= currentBottomIndex) && currentTopIndex !== index) {
      currentTopIndex = index;
      currentBottomIndex = index + renderCount;
      render(index);
    }
    // wrapper.style.height = containerHeight;
  }

  // container.addEventListener('scroll', debounce(scrollEvent, debounceTime));
  container.addEventListener('scroll', scrollEvent);
  preRender();
}