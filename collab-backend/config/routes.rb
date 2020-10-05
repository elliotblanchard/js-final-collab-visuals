Rails.application.routes.draw do
  get '/test', to: 'application#test'

  namespace :api do
    namespace :v1 do
      resources :users, only: [:create] 
      resources :seeds, only: [:create]
      resources :playlists, only: [:index, :create, :destroy]
      post '/login', to: 'auth#create'      
      get '/profile', to: 'users#profile'
    end
  end

end
