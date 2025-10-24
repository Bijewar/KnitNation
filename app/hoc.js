// withReduxProvider.js
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../redux/store'; // Import your Redux store and persistor

const withReduxProvider = (Component) => {
  const WithReduxProvider = (props) => (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Component {...props} />
      </PersistGate>
    </Provider>
  );

  return WithReduxProvider;
};

export default withReduxProvider;
