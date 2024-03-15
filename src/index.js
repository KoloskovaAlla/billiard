import { createRoot } from 'react-dom/client';
import { App } from './App';
// import './styles/index.scss';
// import { BrowserRouter } from 'react-router-dom';
// import { Provider } from 'react-redux';
// import { store } from 'store';

const $root = document.querySelector('#root');
const root = createRoot($root);

root.render(
  // <Provider store={store}> 
  //       <BrowserRouter>
  <App />
  //       </BrowserRouter>   
  // </Provider>
);
