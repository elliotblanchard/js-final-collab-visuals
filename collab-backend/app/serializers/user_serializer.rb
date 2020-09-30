class UserSerializer
    include FastJsonapi::ObjectSerializer
    attributes :username, :admin
    has_many :seeds
end