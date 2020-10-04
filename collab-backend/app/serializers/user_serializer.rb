class UserSerializer
    include FastJsonapi::ObjectSerializer
    attributes :username, :admin, :seeds
end