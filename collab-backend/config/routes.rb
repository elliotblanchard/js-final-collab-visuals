Rails.application.routes.draw do
  get '/test', to: 'application#test'

  namespace :api do
    namespace :v1 do
      resources :users, only: [:create, :show] 
      resources :seeds, only: [:create, :destroy]
      post '/login', to: 'auth#create'
    end
  end

end
