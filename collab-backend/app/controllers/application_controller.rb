class ApplicationController < ActionController::API
    before_action :authorized
    
    def encode_token(payload)
        JWT.encode(payload,ENV['JWT_KEY'])
    end

    def auth_header
        # authorization: 'Bearer <token>'
        request.headers['Authorization']
    end

    def decoded_token
        if auth_header
            token = auth_header.split(' ')[1]
            # header: { 'Authorization': 'Bearer <token>'}
            # Begin/Rescue syntax allows to rescue out of exception
            begin
                JWT.decode(token, ENV['JWT_KEY'], true, algorithm: 'HS256')
            rescue JWT::DecodeError
                nil
            end
        end
    end

    # STEP 2: Authentication helper methods
    def current_user
        if decoded_token
            user_id = decoded_token[0]['user_id']
            user = User.find_by(id: user_id)
        end
    end

    def logged_id?
        !!current_user
        #returns boolean instead of truthy user object
    end

    # STEP 3: Authoirzation helper methods
    def authorized
        render json: { message: 'Please log in' }, status: :unauthorized unless logged_in?
    end
end