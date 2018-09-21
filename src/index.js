const createScroll = ({ container, elements }) => {
  const containerWrapper = document.createElement('div');
  const wrapper = document.createElement('div');
  const fakeDiv = document.createElement('div');
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  const borderTop = container.offsetTop;
  let renderElements = elements;
  let cache = [];

  // ToDo: calculate minimum render amount
  let renderCount = 10;
  let currentIndex = 0;

  // todo: get scrollbar
  const scrollBarWidth = 17;

  container.style.overflowY = 'scroll';

  containerWrapper.style.position = 'absolute';
  containerWrapper.style.width = `${containerWidth - scrollBarWidth}px`;
  containerWrapper.style.height = `${container.clientHeight}px`;
  containerWrapper.style.overflowY = 'hidden';

  wrapper.style.position = 'absolute';

  containerWrapper.appendChild(wrapper);
  container.appendChild(containerWrapper);
  container.appendChild(fakeDiv);
  
  const preRender = () => {
    const content = Array.from(renderElements)
      .reduce((cal, e) => {
        // todo: assign attribute
        return `${cal}<div class="element" style="background: ${e.style.background}">${e.innerHTML}</div>`;
      }, '');
    fakeDiv.innerHTML = content;
    window.requestAnimationFrame(() => {
      fakeDiv.style.height = fakeDiv.scrollHeight + scrollBarWidth + 'px';
      cache = Array.from(fakeDiv.querySelectorAll('div')).map(div => {
        return {
          height: div.clientHeight,
          top: div.offsetTop
        };
      })
      fakeDiv.innerHTML = '';
      render(currentIndex);
    });
  }
  
  const render = (index) => {
    let renderContent = '';
    for (let i = index; i < index + renderCount & i < renderElements.length; i ++ ){
      // todo: assign attribute
      renderContent += `<div class="element" style="background: ${renderElements[i].style.background}">${renderElements[i].innerHTML}</div>`
    }
    wrapper.innerHTML = renderContent;
  }
  
  container.addEventListener('scroll', () => {
    window.requestAnimationFrame(() => {
      const dy = container.scrollTop;
      const index = cache.findIndex(e => dy + borderTop >= e.top && dy + borderTop <= e.top + e.height) ;
      if (index === -1) {
        return;
      }
      const currentDiv = cache[index];
      wrapper.style.transform = `translate(0px, ${-(dy - currentDiv.top + borderTop)}px)`;
      // only recalculate when index changed
      if (currentIndex !== index) {
        render(index);
      }
      currentIndex = index;
    })
  });
  containerWrapper.addEventListener('wheel', (e) => {
    container.scrollTop += e.deltaY; 
  });
  preRender();
}