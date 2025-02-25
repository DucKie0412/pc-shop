import { User, Columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

async function getData() : Promise<User[]>{
    //fetch data here

    return [
        {
            id: "1",
            name: "John Doe",
            email: "akshdaksjhdh@mail.com",
            phone: "0123388234",
            address: "ahdashj auwioqu wqeuqwe",
            isActive: true,
        },
        {
            id: "2",
            name: "Jane Doe",
            email: "akshdaksjhdh@mail.com",
            phone: "0123388234",
            address: "ahdashj auwioqu wqeuqwe",
            isActive: false,
        },
        {
            id: "3",
            name: "John Smith",
            email: "akshdaksjhdh@mail.com",
            phone: "0123388234",
            address: "ahdashj auwioqu wqeuqwe",
            isActive: true,
        },
        {
            id: "4",
            name: "Jane Smith",
            email: "akshdaksjhdh@mail.com",
            phone: "0123388234",
            address: "ahdashj auwioqu wqeuqwe",
            isActive: false,
        },
        {
            id: "1",
            name: "John Doe",
            email: "akshdaksjhdh@mail.com",
            phone: "0123388234",
            address: "ahdashj auwioqu wqeuqwe",
            isActive: true,
        },
        {
            id: "2",
            name: "Jane Doe",
            email: "akshdaksjhdh@mail.com",
            phone: "0123388234",
            address: "ahdashj auwioqu wqeuqwe",
            isActive: false,
        },
        {
            id: "3",
            name: "John Smith",
            email: "akshdaksjhdh@mail.com",
            phone: "0123388234",
            address: "ahdashj auwioqu wqeuqwe",
            isActive: true,
        },
        {
            id: "4",
            name: "Jane Smith",
            email: "akshdaksjhdh@mail.com",
            phone: "0123388234",
            address: "ahdashj auwioqu wqeuqwe",
            isActive: false,
        },
        {
            id: "1",
            name: "John Doe",
            email: "akshdaksjhdh@mail.com",
            phone: "0123388234",
            address: "ahdashj auwioqu wqeuqwe",
            isActive: true,
        },
        {
            id: "2",
            name: "Jane Doe",
            email: "akshdaksjhdh@mail.com",
            phone: "0123388234",
            address: "ahdashj auwioqu wqeuqwe",
            isActive: false,
        },
        {
            id: "3",
            name: "John Smith",
            email: "akshdaksjhdh@mail.com",
            phone: "0123388234",
            address: "ahdashj auwioqu wqeuqwe",
            isActive: true,
        },
        {
            id: "4",
            name: "Jane Smith",
            email: "akshdaksjhdh@mail.com",
            phone: "0123388234",
            address: "ahdashj auwioqu wqeuqwe",
            isActive: false,
        },
    ]

}
export default async function UserPage() {
    const data = await getData();

    return (
        <div className="container mx-auto py-10"> 
            <DataTable columns={Columns} data={data} />
        </div>
    );
}

