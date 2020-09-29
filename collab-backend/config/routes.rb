Rails.application.routes.draw do
  get '/test', to: 'application#test'

  namespace :api do
    namespace :v1 do
      resources :users, only: [:show] 
    end
  end

end
