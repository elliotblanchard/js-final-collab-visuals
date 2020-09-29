class Api::V1::UsersController < ApplicationController
    skip_before_action :authorized, only: [:create] # can't check if user is authorized before user is created
    
    def show
        user = User.find_by_id(params[:id])
        render json: user, include: [:seeds]
    end

    def create
        user = User.create(user_params)
        if user.valid?
            token = encode_token(user_id: user.id) # from application_controller
            # using built-in rails status codes
            render json: { user: UserSerializer.new(user), jwt: token }, status: :created
        else
            render json: { error: 'failed to create user' }, status: :not_acceptable
        end
    end 
    
    private
    
    def user_params
        params.require(:user).permit(:username, :password, :admin)
    end    
end
