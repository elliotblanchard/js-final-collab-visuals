class Api::V1::SeedsController < ApplicationController
    def create
        # Need to add a check that the submitted user_id in params is the same as the logged in user_id
        seed = Seed.create(seed_params)
        if seed.valid?
            render json: { seed: SeedSerializer.new(seed) }, status: :created
        else
            render json: { errors: seed.errors.full_messages }, status: :unprocessible_entity
        end

    end 
    
    private

    def seed_params
        params.require(:seed).permit(:name, :matrix, :user_id)
    end    
end