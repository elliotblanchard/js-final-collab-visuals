class SeedSerializer
    include FastJsonapi::ObjectSerializer
    attributes :name, :matrix 
    belongs_to :user
end