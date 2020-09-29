class Api::V1::UsersController < ApplicationController
    def show
        user = User.find_by_id(params[:id])
        render json: user, include: [:seeds]
    end

    def create
        user = User.create(user_params)
        if user.valid?
            # using built-in rails status codes
            render json: { user: UserSerializer.new(user) }, status: :created
        else
            render json: { error: 'failed to create user' }, status: :not_acceptable
        end
    end 
    
    private
    def user_params
        params.require(:user).permit(:username, :password, :admin)
    end    
end
