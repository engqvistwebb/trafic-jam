import { useEffect, useReducer } from "react";
import createEnturService from '@entur/sdk';

const service = createEnturService({
  clientName: 'gjensidige-codeinterviewtest'
});

interface StateObject {
  promiseQueue: Array<PromiseQueueObject>
  promiseCount: number
}

interface PromiseQueueObject {
  number: number
  request: Promise<any>
}

const EventTypes = {
  ADD_REQUEST: 'ADD_REQUEST',
  RESET_REQUESTS: 'RESET_REQUESTS'
};

interface AddRequestAction {
  type: typeof EventTypes.ADD_REQUEST
  request: Promise<any>
};

interface ResetRequestAction {
  type: typeof EventTypes.RESET_REQUESTS
  request: Promise<any>
};

type Actions = AddRequestAction | ResetRequestAction;

const reducer = (state : StateObject, event : Actions) : StateObject => {
  switch(event.type) {
    case EventTypes.ADD_REQUEST: {
      const _promiseCount = state.promiseCount + 1;
        if (state.promiseQueue[state.promiseQueue.length - 1].number < _promiseCount) {
          state.promiseQueue.push({ number: _promiseCount, request: event.request });
        }
        return {
          ...state,
          promiseCount: _promiseCount,
        }
      }
    case EventTypes.RESET_REQUESTS:
      return {
        ...state,
        promiseCount: 1,
        promiseQueue: [{ number: 1, request: event.request }],
      }
    default: {
    return state;
    }
  }
}

const firstRequestPromise = new Promise((resolve) => {
  service.getDeparturesFromStopPlace('NSR:StopPlace:4000', {
    limit: 20,
    })
    .then(response => resolve(response));
});

const initialState : StateObject = {
  promiseCount: 1,
  promiseQueue: [{ number: 1, request: firstRequestPromise}],
}

export const useRequestPipeline = () => {
  const [state , dispatch] = useReducer(reducer, initialState);

  const requestPromise = new Promise((resolve) => {
    service.getDeparturesFromStopPlace('NSR:StopPlace:4000', {
      limit: 20,
      })
      .then(response => resolve(response));
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: 'ADD_REQUEST', request: requestPromise }); 
    }, 400);
    return () => clearTimeout(timer);
  });

    return [state, dispatch]
}