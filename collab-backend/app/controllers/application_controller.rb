class ApplicationController < ActionController::API
    def encode_token(payload)
        JWT.encode(payload,ENV['JWT_KEY'])
    end

    def auth_header
        request.headers['Authorization']
    end

    def decoded_token

    end
end