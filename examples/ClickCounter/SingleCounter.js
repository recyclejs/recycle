function SingleCounter() {
  return {
    initialState: {
      timesClicked: 0,
    },

    actions: function actions(sources) {
      const button = sources.DOM.select('button')

      return [
        button.events('click')
          .mapTo({ type: 'buttonClicked' }),
      ]
    },

    reducers: function reducers(sources) {
      return [
        sources.actions
          .filterByType('buttonClicked')
          .reducer(function increment(state) {
            state.timesClicked++;
            return state
          }),
      ]
    },

    view: function view(state, props, jsx) {
      return (
        <div>
          <span>Times clicked: {state.timesClicked}</span>
          <button>Click me</button>
        </div>
      )
    },
  }
}

/*
  primjer todomvc
  todolist i todo mijenjaju todos.list
  todolist više ne sluša childSources, samo poziva todo container u view-u
  kako se todo.list promijeni, mijenjaju se oba containera
  (bitno je da se promijene prije rendera)

  novi ciklus
    todolist iz svog containera dobiva listu todoa iz storea, poziva ih u viewu
    todo container se promijenio u međuvremenu i wrapa prez komponentu u kombinaciji storeStatea i propsa od todolist

  zašto container za todo?
    tako da se todolist ne brine kad pobrisat neki todo (todo sam sebe briše)
    todolist tako ne sluša niti jednu akciju todo-a, brine samo za sebe

  komponente su decouplane, komuniciraju tako šta mijenjaju isti state (sa svojim reducerima)

  promjena statea preko immutable
    - na svaki connect, dobije se kopija storea
    - na svaku promjenu reducera, sejva se nova kopija u store

  connect priprema komponentu za korištenje, ne radi force update
  ako se promijeni store iz vana, rendane komponente se ne mijenjaju!
  ali parent koji ih poziva, sad poziva "nove" komponente (promjenom statea od strane parenta, on sam radi update)
*/
export default function SingleCounterContainer() {
  return {
    record: getProp => `todos.list[${getProp('k')}]`,

    initialState: {},

    actions: (sources, props) => {
      return sources.childrenActions
    },

    view: (state, props, jsx) => {
      return <SingleCounter {...props} />
    },
  }
}
