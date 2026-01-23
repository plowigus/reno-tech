export interface Product {
    id: string;
    name: string;
    slug: string;
    category: string;
    description: string;
    price: number;
    image: string;
    images: string[];
    sizes?: string[];
}

export const products: Product[] = [
    {
        id: "1",
        name: "Renotech T-Shirt",
        slug: "renotech-tshirt",
        category: "odziez",
        description: "Wysokiej jakości bawełniana koszulka z logo Renotech. Idealna dla fanów marki Renault i Dacia.",
        price: 99.00,
        image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        images: [
            "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800"
        ],
        sizes: ["S", "M", "L", "XL", "XXL"],
    },
    {
        id: "2",
        name: "Renotech Hoodie",
        slug: "renotech-hoodie",
        category: "odziez",
        description: "Ciepła bluza z kapturem. Nowoczesny design i wytrzymały materiał.",
        price: 199.00,
        image: "https://images.unsplash.com/photo-1513789181297-6f2ec112c0bc?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        images: [
            "https://images.unsplash.com/photo-1513789181297-6f2ec112c0bc?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1620799140171-713807245645?auto=format&fit=crop&q=80&w=800"
        ],
        sizes: ["S", "M", "L", "XL", "XXL"],
    },
    {
        id: "3",
        name: "Brelok Renault Sport",
        slug: "brelok-rs",
        category: "akcesoria",
        description: "Stylowy brelok z emblematem Renault Sport. Wykonany ze stali nierdzewnej.",
        price: 39.00,
        image: "https://images.unsplash.com/photo-1666723129489-4fcfb56d3dc6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        images: [
            "https://images.unsplash.com/photo-1666723129489-4fcfb56d3dc6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1622437943545-2b4f9a0c2834?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1618423691652-3a36214A3621?auto=format&fit=crop&q=80&w=800"
        ],
        sizes: [],
    },
    {
        id: "4",
        name: "Zestaw Naklejek",
        slug: "zestaw-naklejek",
        category: "akcesoria",
        description: "Zestaw naklejek Renotech na auto. Odporne na warunki atmosferyczne.",
        price: 29.00,
        image: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&q=80&w=800",
        images: [
            "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1626245037596-3a36214A3621?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1605218456195-230556215321?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1605218456195-230556215321?auto=format&fit=crop&q=80&w=800"
        ],
        sizes: [],
    },
    {
        id: "5",
        name: "Karta Hands Free Case",
        slug: "etui-karta",
        category: "akcesoria",
        description: "Ochronne etui na kartę Hands Free. Chroni przed zarysowaniami i upadkami.",
        price: 49.00,
        image: "https://images.unsplash.com/photo-1623393945964-8f5d573f9358?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        images: [
            "https://images.unsplash.com/photo-1623393945964-8f5d573f9358?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1616423664045-8c01d4182472?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&q=80&w=800"
        ],
        sizes: [],
    },
];
