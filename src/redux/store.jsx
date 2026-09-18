import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import rootReducer from './rootReducer';
import rootSaga from './rootSaga';

const persistConfig = {
  key: 'root',
  storage,
  // Whitelist: only these reducers will be persisted.
  whitelist: ['auth', 'projects', 'tasks', 'taskLists', 'timesheets', 'userProfile', 'rootData', 'company', 'report', 'roles', 'modules', 'packages', 'permissions'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          'auth/loginFailure',
          'auth/refreshTokenFailure',
          'auth/logoutFailure',
          'auth/forgotPasswordFailure',
          'auth/resetPasswordFailure'
        ],
      }
    }).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== 'production'
});

sagaMiddleware.run(rootSaga);

export const persistor = persistStore(store);