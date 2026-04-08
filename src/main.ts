import './style.css';
import { bootstrapApp } from './app/bootstrap';

const appContext = bootstrapApp();

if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    appContext.dispose();
  });
}
