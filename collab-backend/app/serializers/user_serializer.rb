class UserSerializer
    include FastJsonapi::ObjectSerializer
    attributes :username, :password, :admin
    has_many :seeds
end