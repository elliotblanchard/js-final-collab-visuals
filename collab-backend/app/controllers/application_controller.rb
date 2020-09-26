class ApplicationController < ActionController::API
    def test
        render json: { test: "success" }
    end
end
