package com.kir.homerentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "property")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "property_id")
    private Long propertyId;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private Owner owner;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private PropertyCategory category;

    @ManyToOne
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private String address;

    @Column(name = "price_per_month", nullable = false)
    private BigDecimal pricePerMonth;

    @Column(name = "security_deposit")
    private BigDecimal securityDeposit;

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private Set<PropertyAttributeValue> attributeValues = new HashSet<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private Set<PropertyImage> propertyImages = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "property_amenity",
            joinColumns = @JoinColumn(name = "property_id"),
            inverseJoinColumns = @JoinColumn(name = "amenity_id")
    )
    private Set<Amenity> amenities = new HashSet<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private Set<Lease> leases = new HashSet<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private Set<MaintenanceRequest> maintenanceRequests = new HashSet<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private Set<Review> reviews = new HashSet<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    private Set<PropertyViewing> viewings = new HashSet<>();
}