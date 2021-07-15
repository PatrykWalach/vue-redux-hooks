import { mount } from '@cypress/vue'
import { configureStore } from '@reduxjs/toolkit'
import { fetchBaseQuery, setupListeners } from '@reduxjs/toolkit/query'
import { defineComponent, h, ref } from 'vue-demi'
import { createApi } from '../'
import { install } from '../install'

interface Post {
  id: number
  body: string
  fresh: boolean
}

const posts: Post[] = [{ body: 'Test post', id: 1, fresh: false }]

const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
  }),
  tagTypes: ['Post'],

  endpoints: (build) => ({
    getPosts: build.query<Post[], boolean>({
      query: (fresh) => ({
        url: '/posts',
        params: {
          fresh,
        },
      }),
      providesTags: ['Post'],
    }),

    addPost: build.mutation<Post, string>({
      query: (body) => ({ url: '/add-post', body, method: 'POST' }),
      invalidatesTags: ['Post'],
    }),
  }),
  reducerPath: 'api',
})

const store = configureStore({
  reducer: { [api.reducerPath]: api.reducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
})

setupListeners(store.dispatch)

const App = defineComponent({
  setup() {
    const fresh = ref(true)
    const query = api.useGetPostsQuery(fresh)
    const [addPost, mutation] = api.useAddPostMutation()

    const post = ref('New post')

    return () => [
      h(
        'button',
        {
          class: 'toggle',
          onClick() {
            fresh.value = !fresh.value
          },
        },
        'Show fresh',
      ),
      h('hr'),
      h('input', {
        value: post.value,
        onChange(event: any) {
          post.value = event.target.value
        },
      }),
      h(
        'button',
        {
          class: 'add',
          async onClick() {
            const newPost = post.value
            post.value = ''
            try {
              await addPost(newPost).unwrap()
            } catch {
              post.value = newPost
            }
          },
          disabled: mutation.isLoading,
        },
        'Add post',
      ),

      query.isLoading
        ? h('div', { class: 'loading' }, 'Loading...')
        : // : query.isError
        // ? h('div')
        query.data && query.data.length
        ? query.data.map(({ body, id }) =>
            h('div', { class: 'post', key: id }, body),
          )
        : h('div', { class: 'no-results' }, 'No results'),
    ]
  },
})

describe('createApi', () => {
  it('query and mutation', () => {
    cy.intercept('/api/posts?fresh=*', (req) => {
      req.reply({
        body:
          req.query.fresh === 'true'
            ? posts.filter(({ fresh }) => fresh)
            : posts,
        delay: 1000,
      })
    }).as('posts')

    cy.intercept('/api/add-post', (req) => {
      const newPost = {
        id: 1 + Math.max(0, ...posts.map(({ id }) => id)),
        body: req.body,
        fresh: true,
      }
      posts.push(newPost)
      req.reply({
        body: newPost,
        delay: 1000,
      })
    }).as('add-post')

    mount(App, {
      global: {
        plugins: [install(store)],
      },
    })

    cy.get('.loading')
    cy.wait('@posts')
    cy.get('.no-results')

    cy.get('.toggle').click()
    cy.wait('@posts')
    cy.get('.post').contains('Test post')

    cy.get('.add').should('not.be.disabled').click().should('be.disabled')
    cy.wait('@add-post')

    cy.get('.loading')
    cy.wait('@posts')
    cy.get('.post').contains('New post')
  })
})
