class SeedSerializer
    include FastJsonapi::ObjectSerializer
    attributes :name, :matrix, :user
end